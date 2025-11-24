// ============================================================================
// Equipment-Based Spell System - Main Entry Point
// ============================================================================
// This system grants spells to players based on their equipped items.
// When an item is equipped, the associated spell is learned.
// When an item is unequipped, the associated spell is removed.
// ============================================================================

import { logger } from "../logger";
import { EquipmentSpellDataMessage } from "../shared/Messages";

/**
 * Get all spell IDs from an item that have ON_LEARN trigger
 * @param itemEntry - The item entry ID
 * @returns Array of spell IDs with ON_LEARN trigger (trigger type 6)
 */
function getOnLearnItemSpells(itemEntry: uint32): number[] {
    const spellIDs: number[] = [];
    
    const query = `SELECT spellid_1, spelltrigger_1, spellid_2, spelltrigger_2, spellid_3, spelltrigger_3, spellid_4, spelltrigger_4, spellid_5, spelltrigger_5 FROM item_template WHERE entry = ${itemEntry}`;
    const result = QueryWorld(query);
    
    if (!result.GetRow()) {
        return spellIDs;
    }
    
    // Check all 5 spell slots
    for (let i = 0; i < 5; i++) {
        const spellID = result.GetInt32(i * 2);      // spellid columns are at index 0, 2, 4, 6, 8
        const spellTrigger = result.GetInt32(i * 2 + 1); // trigger columns are at index 1, 3, 5, 7, 9
        
        // 6 = ON_LEARN trigger type
        if (spellID > 0 && spellTrigger == 6) {
            spellIDs.push(spellID);
        }
    }
    
    return spellIDs;
}

/**
 * Send all ON_LEARN item data to client at once
 * Only sends equippable items (excludes recipes, consumables, etc.)
 * @param player - The player to send the data to
 */
function sendAllOnLearnItemsToClient(player: TSPlayer) {
    logger.debug(`Sending all ON_LEARN item data to ${player.GetName()}...`);
    
    // Query all EQUIPPABLE items that have ON_LEARN spells (trigger = 6)
    // InventoryType > 0 means it's equippable (excludes bags, recipes, consumables)
    // InventoryType 0 = non-equippable, 1-20+ = various equipment slots
    const query = `
        SELECT DISTINCT entry, spellid_1, spelltrigger_1, spellid_2, spelltrigger_2, 
               spellid_3, spelltrigger_3, spellid_4, spelltrigger_4, spellid_5, spelltrigger_5 
        FROM item_template 
        WHERE (spelltrigger_1 = 6 OR spelltrigger_2 = 6 OR spelltrigger_3 = 6 
               OR spelltrigger_4 = 6 OR spelltrigger_5 = 6)
          AND InventoryType > 0
    `;
    
    const result = QueryWorld(query);
    let itemCount = 0;
    
    // Process each item with ON_LEARN spells
    while (result.GetRow()) {
        const itemEntry = result.GetUInt32(0);
        const spellIDs: number[] = [];
        
        // Check all 5 spell slots
        for (let i = 0; i < 5; i++) {
            const spellID = result.GetInt32(1 + i * 2);      // Columns: spellid_1, spellid_2, etc.
            const spellTrigger = result.GetInt32(2 + i * 2);  // Columns: spelltrigger_1, spelltrigger_2, etc.
            
            if (spellID > 0 && spellTrigger == 6) {
                spellIDs.push(spellID);
            }
        }
        
        if (spellIDs.length > 0) {
            const message = new EquipmentSpellDataMessage(itemEntry, spellIDs);
            message.write().SendToPlayer(player);
            itemCount++;
        }
    }
    
    logger.debug(`Sent ${itemCount} equippable items with ON_LEARN spells to ${player.GetName()}`);
}

export function Main(events: TSEvents) {
    // Send all ON_LEARN item data to client on login
    events.Player.OnLogin((player) => {
        sendAllOnLearnItemsToClient(player);
    });
    
    // Learn spells when equipping items
    events.Item.OnEquip((item, player, slot, isMerge) => {
        const spellIDs = getOnLearnItemSpells(item.GetEntry());
        for (const spellID of spellIDs) {
            logger.debug(`Learning spell ${spellID} from item ${item.GetEntry()}`);
            player.LearnSpell(spellID);
        }
    });
    
    // Remove spells when unequipping items
    events.Item.OnUnequip((item, player, isSwap, result) => {
        const spellIDs = getOnLearnItemSpells(item.GetEntry());
        for (const spellID of spellIDs) {
            logger.debug(`Removing spell ${spellID} from item ${item.GetEntry()}`);
            player.RemoveSpell(spellID, false, false);
        }
    });
}
