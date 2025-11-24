# Equipment Spells

A TSWoW module that automatically grants and removes spells granted by items when items are equipped/unequipped.

## Features

- Automatically learns/removes spells when equipping/unequipping items
- Custom tooltips display "Learn: [Spell Name]" with spell descriptions
- Works on all tooltip types (hover, chat links, item comparisons)

## How It Works

Items with `ON_LEARN` spell triggers will automatically teach their spells when equipped and remove them when unequipped.

Just add the following to any item:

```
.Spells.addMod(spell => {
    spell.Spell.set(<your spell id>)
        .Trigger.ON_LEARN.set()
})
```

See [datascripts/items/cow-bone-mace.ts] for working example.

## Structure

```
datascripts/
  items/cow-bone-mace.ts   # Example item and spell definitions
livescripts/
  livescripts.ts           # Server-side: Handles ON_LEARN item spells
  spells/marrow-strike.ts  # Ignore
addon/
  addon.ts                 # Custom tooltips showing learned spells
shared/
  Messages.ts              # Client-server communication packets
```

## Technical Details

- Uses database queries to read `item_template` spell data (trigger type 6 = ON_LEARN)
- Will learn/unlearn all 5 possible spell slots per item. Ignores non-ON_LEARN spell types
