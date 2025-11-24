// ============================================================================
// Cow Bone Mace - Item Definition
// ============================================================================
// A simple 1H mace that grants the Marrow Strike spell when equipped.
// ============================================================================

import { std } from "wow/wotlk";
import { logger } from "../logger" // This works. See build/ directory after compiling.

// ============================================================================
// Marrow Strike - Spell
// ============================================================================
// A cone attack that strikes multiple enemies in front of the caster.
// The 10% stun proc is handled in livescripts.
// ============================================================================

export const MARROW_STRIKE_SPELL = std.Spells
    .create('equipment-spells', 'marrow-strike', 120) // Cone of Cold base
    .Name.enGB.set('Marrow Strike')
    .Description.enGB.set('Strikes enemies in front of you. 10% chance to stun.')
    .Icon.setFullPath('Interface\\Icons\\inv_misc_bone_01')
    .Visual.modRefCopy((visual: any) => {
        visual.cloneFromSpell(1752); // Sinier Strike
    })
    .Power.mod((x: any) => x
        .Type.MANA.set()
        .CostPercent.set(0)
    )
    .CastTime.set(0)
    .Effects.mod(0, (effect: any) => {
        effect.Type.WEAPON_DAMAGE_NOSCHOOL.set()
            .DamageBase.set(5)
            .DamageDieSides.set(6)
    })
    .Tags.add('equipment-spells', 'marrow-strike-tag');

// Clear the other two effects (we don't want slow or frost damage)
MARROW_STRIKE_SPELL.Effects.get(1).Type.set(0);
MARROW_STRIKE_SPELL.Effects.get(2).Type.set(0);

// Set 0.5 second cooldown (Cone of Cold has 10 second cooldown)
MARROW_STRIKE_SPELL.row.RecoveryTime.set(500); // 500ms = 0.5 seconds
MARROW_STRIKE_SPELL.row.CategoryRecoveryTime.set(500);

logger.debug(`Marrow Strike created (ID: ${MARROW_STRIKE_SPELL.ID})`);

// ============================================================================
// Bone Stun - Proc Effect for Marrow Strike
// ============================================================================
// A 5-second stun applied when Marrow Strike procs.
// ============================================================================

export const BONE_STUN_SPELL = std.Spells
    .create('equipment-spells', 'bone-stun') // Create from scratch, no base spell
    .Name.enGB.set('Bone Crush')
    .Description.enGB.set('Stunned by a crushing bone strike.')
    .Icon.setFullPath('Interface\\Icons\\INV_Misc_Bone_HumanSkull_01')
    .Mechanic.set(12) // 12 = STUN mechanic
    .Duration.modRefCopy((x: any) => x
        .Duration.set(3000)
        .MaxDuration.set(3000)
    )
    .CastTime.set(0)
    .Power.mod((x: any) => x
        .Type.MANA.set()
        .CostPercent.set(0)
    )
    .Range.setSimple(0, 100)
    .Effects.addMod((effect: any) => {
        effect.Type.APPLY_AURA.set()
            .Aura.MOD_STUN.set()
            .ImplicitTargetA.UNIT_TARGET_ENEMY.set();
    })
    .Tags.add('equipment-spells', 'bone-stun-tag');

logger.debug(`Bone Stun created (ID: ${BONE_STUN_SPELL.ID})`);

export const COW_BONE_MACE = std.Items
    .create('equipment-spells', 'cow-bone-mace', 11411) // Large Bear Bone base
    .Name.enGB.set('Cow Bone')
    .Description.enGB.set('Udderly devastating.')
    .Quality.WHITE.set()
    .ItemLevel.set(1)
    .RequiredLevel.set(1)
    .Class.MACE_1H.set()
    .InventoryType.MAINHAND.set()
    .Material.WOOD.set()
    .Damage.clearAll()
    .Damage.addPhysical(8, 12) // Average 10 damage
    .Delay.set(2000) // 2.0 speed = 2000ms, so 10/2  = 5.0 DPS
    .Stats.clearAll()
    .Spells.addMod(spell => {
        spell.Spell.set(MARROW_STRIKE_SPELL.ID)
            .Trigger.ON_LEARN.set()
    })
    .Tags.add('equipment-spells', 'cow-bone-tag');

logger.debug(`Cow Bone created (ID: ${COW_BONE_MACE.ID})`);


