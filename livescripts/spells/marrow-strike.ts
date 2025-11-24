// ============================================================================
// Marrow Strike - Spell Behavior
// ============================================================================
// Implements the special proc behavior for Marrow Strike:
// 10% chance to stun each target hit by the cone attack.
// ============================================================================

import { logger } from '../../logger';

/**
 * Register Marrow Strike spell behavior
 * Adds 10% chance to stun targets hit by the cone attack
 */
export function Main(events: TSEvents) {
    const MARROW_STRIKE_SPELL_ID = UTAG('equipment-spells', 'marrow-strike-tag');
    const BONE_STUN_SPELL_ID = UTAG('equipment-spells', 'bone-stun-tag');

    // OnEffect fires for each effect applied to each target
    events.Spell.OnEffect(MARROW_STRIKE_SPELL_ID, (spell, cancel, info, mode, unitTarget, item, obj, corpse) => {
        // Only process if we have a unit target
        if (!unitTarget || unitTarget.IsNull()) {
            return;
        }
        
        const caster = spell.GetCaster();
        if (!caster.IsPlayer()) {
            return;
        }
        
        // 10% chance to stun each target hit
        const roll = Math.random() * 100;
        
        if (roll <= 10) {
            // Apply the stun by casting the stun spell on the target
            caster.CastSpell(unitTarget, BONE_STUN_SPELL_ID, true);

            // Visual feedback
            const player = caster.ToPlayer();
            if (player) {
                player.SendBroadcastMessage('|cFFFFFF00Bone Crush!|r');
            }
        }
    });

    logger.debug(`Marrow Strike behavior registered`);
}
