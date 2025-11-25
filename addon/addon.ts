// ============================================================================
// Equipment Spells Tooltip Addon
// ============================================================================
// Highlights items that grant spells when equipped
// ============================================================================

import { EQUIPMENT_SPELL_DATA_ID, EquipmentSpellDataMessage } from "../shared/Messages";

// Store items that have ON_LEARN spells
const equipmentSpellItems: Map<number, number[]> = new Map();

/** @compileMembersOnly */
declare const tostring: (value: any) => string;

// WoW API for getting spell information
// GetSpellInfo returns: name, rank, icon, cost, isFunnel, powerType, castTime, minRange, maxRange
/** @compileMembersOnly */
declare const GetSpellInfo: (spellID: number) => any;

/** @compileMembersOnly */
declare const GetSpellDescription: (spellID: number) => string;

// Helper to extract item ID from link
function extractItemID(link: string): number | undefined {
    // Use JavaScript-style string methods that TSTL can handle
    const itemPrefix = "item:";
    const startIdx = link.indexOf(itemPrefix);
    if (startIdx === -1) return undefined;
    
    const numStart = startIdx + itemPrefix.length;
    let numEnd = numStart;
    
    // Find the end of the number
    while (numEnd < link.length && link.charAt(numEnd) >= '0' && link.charAt(numEnd) <= '9') {
        numEnd++;
    }
    
    if (numEnd === numStart) return undefined;
    
    const idStr = link.substring(numStart, numEnd);
    return tonumber(idStr) || undefined;
}

// Receive equipment spell data from server
// Server only sends equippable items with ON_LEARN (excludes recipes, consumables, etc.)
OnCustomPacket(EQUIPMENT_SPELL_DATA_ID, (packet) => {
    const message = new EquipmentSpellDataMessage(0, []);
    message.read(packet);
    
    if (message.spellIDs.length > 0) {
        equipmentSpellItems.set(message.itemID, message.spellIDs);
        console.log(`Received spell data for item ${message.itemID}: ${message.spellIDs.join(", ")}`);
    }
});

// Helper function to add spell info to tooltip
function addSpellInfoToTooltip(tooltip: any, itemID: number) {
    const spellIDs = equipmentSpellItems.get(itemID);
    
    if (spellIDs && spellIDs.length > 0) {
        // Add each spell with name and description
        for (const spellID of spellIDs) {
            // GetSpellInfo returns multiple values
            // Use tostring to safely convert the result
            const spellName = tostring(select(1, GetSpellInfo(spellID)));
            const spellDesc = GetSpellDescription(spellID);
            
            if (spellName && spellName !== "nil" && spellName.length > 0) {
                // Add "Learn: SpellName" on one line with color codes
                // Green "Learn:" and cyan spell name
                tooltip.AddLine("|cff00ff00Learn:|r |cff71d5ff" + spellName + "|r", 1.0, 1.0, 1.0);
                
                // Add spell description in gray, wrapped text
                if (spellDesc && spellDesc.length > 0) {
                    tooltip.AddLine("  " + spellDesc, 0.8, 0.8, 0.8, true);
                }
            } else {
                // Fallback if spell info not available
                tooltip.AddLine("|cff00ff00Learn:|r Spell ID: " + tostring(spellID), 1.0, 1.0, 1.0);
            }
        }
        
        tooltip.Show(); // Refresh to show new lines
    }
}

// Declare tooltip frames
/** @compileMembersOnly */
declare const ItemRefTooltip: any;

/** @compileMembersOnly */
declare const ShoppingTooltip1: any;

/** @compileMembersOnly */
declare const ShoppingTooltip2: any;

/** @compileMembersOnly */
declare const ShoppingTooltip3: any;

/** @compileMembersOnly */
declare const hooksecurefunc: (funcName: string, hookFunc: (...args: any[]) => void) => void;

// Common function to hook a tooltip
function hookTooltip(tooltip: any) {
    tooltip.HookScript("OnTooltipSetItem", (self: any) => {
        // GetItem() returns (name, link) - use select(2, ...) to get the link
        const link = select(2, self.GetItem());
        if (!link) return;
        
        // Extract item ID from link
        const itemID = extractItemID(link);
        if (!itemID) return;
        
        addSpellInfoToTooltip(self, itemID);
    });
}

// Hook all item tooltips
hookTooltip(GameTooltip);           // Main tooltip
hookTooltip(ItemRefTooltip);        // Chat link tooltips
hookTooltip(ShoppingTooltip1);      // Comparison tooltip 1
hookTooltip(ShoppingTooltip2);      // Comparison tooltip 2
// ShoppingTooltip3 exists but is rarely used

console.log("Equipment Spells Tooltip Addon loaded!")