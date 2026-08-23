# Upgrading from v1.x to v2

v2 is a rework of the Grid module ("Major rework to decouple grid logic from owlbear") to make it work
off an immutable snapshot instead of a mutable global singleton. The Metadata module is unaffected
beyond one removed deprecated method (`clean()`, on both `BaseMetadataMapper` and `ItemMetadataMapper`).

## Grid

### `grid` still works the same for basic usage

If all you did was `import { grid } from '@davidsev/owlbear-utils'` and call `getCell`/`snapTo`/`measure`/
`awaitReady` on it, nothing changes — `grid` is still exported, still auto-initialised, and still has all
those methods.

```ts
import { grid, SnapTo } from '@davidsev/owlbear-utils';

await grid.awaitReady();
const cell = grid.getCell(point);
grid.snapTo(point, SnapTo.CENTER);
```

works identically in v1 and v2.

### `Grid` is no longer a singleton class

In v1, `Grid` was one concrete class you got an instance of via `Grid.getInstance()` (which is what
`grid` was). In v2, `Grid` is an **abstract base class** — an immutable snapshot for *one* grid type — so
you can't instantiate it directly, and there's no `getInstance()`. Use `buildGrid(gridData, scaleData)`
to get a grid, which picks the right concrete subclass for you.

- If you called `Grid.getInstance()` yourself: use the exported `grid` singleton instead (it's already
  the live, auto-updating instance).
- If you imported the `Grid` class expecting to type something as "a grid": in v1 that almost always
  meant the `grid` singleton, which is now a `LiveGrid`, not a `Grid` — type it as `LiveGrid`, or use
  `grid.snapshot` (an `AnyGrid`) if you need a point-in-time snapshot instead of the live object. Use
  `AnyGrid` directly for a standalone snapshot, eg. one you got from `buildGrid()`.

### Cell classes no longer read from the global `grid`

In v1, `Square`/`VHex`/etc. read the ambient `grid` singleton internally, so cells only ever needed a
`center`. In v2, every cell holds a reference to the specific `Grid` snapshot it came from
(`cell.grid`), passed into its constructor: `new Square(center, gridInstance)`.

This mostly matters if you constructed cells directly rather than via `grid.getCell()`:

- **`Square.fromCoords(point)` / `VHex.fromCoords(point)` / `HHex.fromCoords(point)` /
  `Isometric.fromCoords(point)` / `Dimetric.fromCoords(point)` are gone.** Use `grid.getCell(point)` (or
  `someGridSnapshot.getCell(point)`) instead — that's the one entry point for turning a `Vector2` into a
  cell now. `grid.getCell()` returns `AnyCell`, a union of the concrete subclasses rather than the
  general `Cell` type `fromCoords()` used to return — narrow via `instanceof` if you need eg. a `Square`
  specifically (see the README's "Working with a specific grid type" section).
- **`Square.iterateCellsBoundingPoints(cells)` (a static) is gone — as are the `VHex`/`HHex`/`Isometric`/
  `Dimetric` equivalents.** Use `grid.iterateCellsBoundingPoints(cells)` instead (same method, now on the
  grid rather than the cell class, and works for every grid type rather than needing a per-type static).
- `VHex.fromAxial(q, r)` / `HHex.fromAxial(q, r)` still exist, but now take the grid as a third argument:
  `VHex.fromAxial(q, r, grid)`.
- `new Square(center)` is now `new Square(center, grid)` — same for the other cell classes. You only need
  this if you were constructing cells directly instead of via `getCell()`/`neighbors()`/etc, which is
  uncommon.

### Unsupported measurement/grid combinations now throw instead of returning `0`

`grid.measure()` on a combination that doesn't make sense (eg. `MANHATTAN` on a hex grid) used to
silently return `0`. It now throws. If you were relying on the `0` (eg. to mean "no distance"), catch the
error instead — a silent `0` for an unsupported measurement was almost certainly masking a bug rather
than being useful.

`grid.iterateCellsBoundingPoints()` also gained a throw: v1 silently cast cells from a different grid
type through; v2 throws if any cell wasn't created from a snapshot of the current grid type.

