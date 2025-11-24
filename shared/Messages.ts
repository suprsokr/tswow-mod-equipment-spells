// ============================================================================
// Equipment Spells - Shared Messages
// ============================================================================
// Defines packets for client-server communication
// ============================================================================

export const EQUIPMENT_SPELL_DATA_ID = 100;

/**
 * Message to send item spell data from server to client
 * Format: itemID + array of spellIDs
 */
export class EquipmentSpellDataMessage {
    itemID: uint32 = 0;
    spellIDs: uint32[] = [];
    
    constructor(itemID: uint32, spellIDs: uint32[]) {
        this.itemID = itemID;
        this.spellIDs = spellIDs;
    }
    
    read(packet: TSPacketRead): void {
        this.itemID = packet.ReadUInt32();
        const count = packet.ReadUInt32();
        this.spellIDs = [];
        for (let i = 0; i < count; i++) {
            this.spellIDs.push(packet.ReadUInt32());
        }
    }
    
    write(): TSPacketWrite {
        const packet = CreateCustomPacket(EQUIPMENT_SPELL_DATA_ID, 0);
        packet.WriteUInt32(this.itemID);
        packet.WriteUInt32(this.spellIDs.length);
        for (const spellID of this.spellIDs) {
            packet.WriteUInt32(spellID);
        }
        return packet;
    }
}

