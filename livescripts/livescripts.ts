// ============================================================================
// Equipment-Based Spell System - Main Entry Point
// ============================================================================
// This system grants spells to players based on their equipped items.
// When an item is equipped, the associated spell is learned.
// When an item is unequipped, the associated spell is removed.
// ============================================================================

import { logger } from "../logger";

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
        logger.debug(`  ERROR: No item template found in database for entry ${itemEntry}`);
        return spellIDs;
    }
    
    // Check all 5 spell slots
    for (let i = 0; i < 5; i++) {
        const spellID = result.GetInt32(i * 2);      // spellid columns are at index 0, 2, 4, 6, 8
        const spellTrigger = result.GetInt32(i * 2 + 1); // trigger columns are at index 1, 3, 5, 7, 9
        
        // 6 = ON_LEARN trigger type
        if (spellID > 0 && spellTrigger == 6) {
            logger.debug(`  Found ON_LEARN spell - Slot ${i}: SpellID ${spellID}`);
            spellIDs.push(spellID);
        }
    }
    
    return spellIDs;
}

export function Main(events: TSEvents) {
    events.Item.OnEquip((item, player, slot, isMerge) => {
        const spellIDs = getOnLearnItemSpells(item.GetEntry());
        for (const spellID of spellIDs) {
            logger.debug(`  -> Learning spell: ${spellID}`);
            player.LearnSpell(spellID);
        }
    });
    
    events.Item.OnUnequip((item, player, isSwap, result) => {
        const spellIDs = getOnLearnItemSpells(item.GetEntry());
        for (const spellID of spellIDs) {
            logger.debug(`  -> Removing spell: ${spellID}`);
            player.RemoveSpell(spellID, false, false);
        }
    });
}
