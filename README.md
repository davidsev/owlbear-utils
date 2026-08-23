# @davidsev/owlbear-utils

Utility functions for [Owlbear Rodeo](https://www.owlbear.rodeo/) extensions, built on top of `@owlbear-rodeo/sdk`.

Two independent pieces:

- **Grid** — grid math (square, hex, isometric, dimetric) for turning a point into a cell, snapping,
  measuring distance, and finding neighbours — computed from a snapshot rather than round-tripping
  through the SDK every time.
- **Metadata** — strongly-typed wrappers around OBR's untyped `Metadata` objects (room, scene, player,
  item, tool), with an optional in-memory cache.

The main rationale for Grid: do grid math without needing to know or care which grid type the scene
is using, and do it with a synchronous API — the SDK's own grid functions are async, which is fine
occasionally but not when you're recomputing thousands of points on every mouse move.

Upgrading from v1? See [UPGRADING.md](./UPGRADING.md).

## Installation

```
npm install @davidsev/owlbear-utils
```

Requires `@owlbear-rodeo/sdk` v3.x, installed automatically as a regular dependency.

## Grid

### The `grid` singleton

The package exports a ready-to-use `grid` object (a `LiveGrid`) that watches `OBR.scene.grid` and keeps
itself up to date. It's wired up automatically — you don't need to construct or `init()` it yourself.

```ts
import { grid, SnapTo } from '@davidsev/owlbear-utils';

await grid.awaitReady(); // resolves once the first grid data has loaded

const cell = grid.getCell({ x: 120, y: 45 });
console.log(cell.center, cell.corners);

const snapped = grid.snapTo({ x: 120, y: 45 }, SnapTo.CENTER_AND_EDGE);

const cellB = grid.getCell({ x: 220, y: 45 });
const distanceInCells = grid.measure(cell, cellB); // or Vector2s, or a mix

const unsubscribe = grid.onChange((newGrid) => {
    console.log('Grid changed to', newGrid.type);
});
```

`grid` implements the SDK's `Grid` interface (`dpi`, `style`, `type`, `measurement`, `scale`, ...), so
it's a drop-in wherever the SDK's `Grid` type is expected, plus:

- `getCell(point)` — the `Vector2` → `AnyCell` for the current grid type.
- `snapshot` — an immutable, point-in-time `AnyGrid` (`SquareGrid | VHexGrid | HHexGrid | IsometricGrid | DimetricGrid`)
  of the grid's current state — useful if you need to pass a grid around without it changing under you, or
  outside the live `grid` singleton (eg. in a worker).
- `snapTo(point, snapTo)` — snap to the nearest corner/center/edge (`SnapTo` is a bitflag enum).
- `measure(...pointsOrCells)` — distance between points/cells, in grid cells, using whatever
  measurement (`EUCLIDEAN`/`CHEBYSHEV`/`MANHATTAN`/`ALTERNATING`) the scene is configured with. With
  three or more arguments it sums the distance between each consecutive pair (a path length); with zero
  or one it returns `0`. Square, isometric and dimetric grids support all four measurements; hex grids
  only support `EUCLIDEAN`/`CHEBYSHEV` (hexes have no meaningful Manhattan/Alternating distance). Asking
  for an unsupported combination throws.
- `gridScale` — the SDK's parsed `GridScale` (`{ raw, parsed: { multiplier, unit, digits } }`); multiply
  a `measure()` result by `grid.gridScale.parsed.multiplier` to get scene units.
- `hexRadius` — the centre-to-corner distance on hex grids.
- `getNearestSnapType(point)` — `SnapTo.CENTER` if `point` snaps closest to the cell's centre,
  `SnapTo.CORNER` otherwise. Note this compares against edges too, so a point nearest an edge midpoint
  reports `CORNER` even when the centre is the closer of centre-vs-corner.
- `iterateCellsBoundingPoints(cells)` — every cell in the axis-aligned bounding box of the given
  cells, in that grid type's own cell coordinates (x/y for square, q/r for hex, u/v for
  isometric/dimetric). This is a bounding box, not a hull and not a minimal set — three cells in an L
  shape return the full 3x3 block — since exact is expensive and most callers just want "everything a
  viewport redraw might touch".
- `onChange(callback)` — subscribe to grid changes; returns an unsubscribe function. Unlike the SDK's
  own event, this fires *after* `grid`'s own data has already updated, so it's safe to read `grid`
  synchronously from inside the callback.
- `awaitReady()` — resolves once the first grid data has loaded (instantly if it already has). Every
  other member of `grid` throws `Grid data not loaded yet` until then, so call this (or await it) before
  touching `grid` at module load time.

### Cells

`getCell()` returns an `AnyCell` (`Square`, `VHex`, `HHex`, `Isometric` or `Dimetric`, depending on the
scene's grid type). Every cell has:

- `.center` / `.corners` / `.edges` — `Point`s and `LineSegment`s.
- `.containsPoint(point)`
- `.isAdjacent(otherCell)` — whether the two cells share an edge. Narrower than `neighbors` below —
  eg. on square/isometric/dimetric grids only 4 of the 8 cells from `neighbors(true)` are adjacent, the
  other 4 being diagonal.
- `.neighbors(includeCorners)` — the surrounding cells; `includeCorners` includes diagonals (ignored
  for hex grids, which have no diagonal neighbours).
- `.nearestPointOnEdge(point)`
- `.grid` — the `Grid` snapshot the cell was created from.

Hex cells (`VHex`/`HHex`) additionally have `.axialCoords` (`[q, r, s]`) and a `VHex.fromAxial(q, r, grid)`
/ `HHex.fromAxial(q, r, grid)` static constructor. Isometric/dimetric cells have `.axonometricCoords`
(`[u, v]`).

### Working with a specific grid type

`grid.getCell()` returns `AnyCell` (`Square | VHex | HHex | Isometric | Dimetric`) rather than the
general `Cell` base type, so it already satisfies `iterateCellsBoundingPoints`'s type signature with no
cast. To narrow it to a concrete class (eg. a `VHex` with `.axialCoords`), use `instanceof`:

```ts
import { grid, VHex } from '@davidsev/owlbear-utils';

const cell = grid.getCell(point);
if (cell instanceof VHex) {
    console.log(cell.axialCoords); // typed as VHex, not Cell
}
```

To get a concrete `Grid` subclass instead of a cell (eg. to call `VHex.fromAxial(q, r, grid)`, whose
`grid` parameter is typed `VHexGrid`), narrow `grid.snapshot` on `.type`:

```ts
import { grid, type AnyGrid } from '@davidsev/owlbear-utils';

const g: AnyGrid = grid.snapshot;
if (g.type === 'HEX_VERTICAL') {
    const cell = VHex.fromAxial(q, r, g); // g is typed as VHexGrid here
}
```

### Building a grid without a live scene

`buildGrid(gridData, scaleData)` builds the right concrete `Grid` subclass (`SquareGrid`, `VHexGrid`,
`HHexGrid`, `IsometricGrid`, `DimetricGrid`) from raw SDK grid/scale data — useful in tests, or any time
you have grid settings that didn't come from `OBR.scene.grid`. `assertSupportedGridType(type)` throws
early if OBR ever reports a grid type this package doesn't know about yet.

```ts
import { buildGrid } from '@davidsev/owlbear-utils';

const testGrid = buildGrid(
    {
        dpi: 100,
        style: { lineType: 'SOLID', lineOpacity: 1, lineColor: 'LIGHT', lineWidth: 1 },
        type: 'SQUARE',
        measurement: 'CHEBYSHEV',
        scale: '5ft',
    },
    { raw: '5ft', parsed: { multiplier: 5, unit: 'ft', digits: 0 } },
);

const cell = testGrid.getCell({ x: 10, y: 10 });
```

You can also construct a concrete subclass directly (`new SquareGrid(gridData, scaleData)`) if you
already know the type — it validates the data matches at construction time either way.

### `Point` and `LineSegment`

`Point` is an immutable `Vector2` with arithmetic helpers: `add`, `sub`, `scale`/`mult`, `div`,
`roundToNearest`/`roundUpToNearest`/`roundDownToNearest`, `distanceTo`, `equals` (true if both x and y
are within 1 unit — a per-axis check, not a radial distance — to absorb floating point noise), and
`Point.nearestPoint(center, points)`.

`LineSegment` wraps two `Point`s (`p1`/`p2`, normalised so direction doesn't matter for `equals()`) and
exposes `.length`.

## Metadata

Each storage location (room, scene, player, item) has a `*MetadataMapper` class that stores your data
under a single namespaced key, filling in defaults for anything missing:

```ts
import { RoomMetadataMapper } from '@davidsev/owlbear-utils';

interface MyRoomData {
    count: number;
}

const roomData = new RoomMetadataMapper<MyRoomData>('com.example.my-extension/room', { count: 0 });

const data = await roomData.get();
await roomData.set({ count: data.count + 1 });
```

`SceneMetadataMapper` and `PlayerMetadataMapper` work the same way, against the scene and player's
metadata respectively. `ToolMetadataMapper` is the odd one out: its first constructor argument is the
**tool id** you registered with `OBR.tool.create()`, not an arbitrary namespace, and your fields are
written at the root of that tool's metadata (OBR already namespaces per tool id) rather than under a
sub-key.

`ItemMetadataMapper` is the same idea but synchronous, since it reads/writes an in-memory `Item` object's
`.metadata` directly rather than calling the SDK:

```ts
import { ItemMetadataMapper } from '@davidsev/owlbear-utils';

const itemData = new ItemMetadataMapper<{ hp: number }>('com.example.my-extension/item', { hp: 10 });
const hp = itemData.get(item).hp;
itemData.set(item, { hp: hp - 1 });
```

`CachedRoomMetadata` / `CachedSceneMetadata` / `CachedPlayerMetadata` wrap the corresponding mapper with
an in-memory cache kept fresh via the SDK's change events, so reads are synchronous once loaded:

```ts
import { CachedSceneMetadata } from '@davidsev/owlbear-utils';

const sceneData = new CachedSceneMetadata<{ enabled: boolean }>('com.example.my-extension/scene', {
    enabled: false,
});

await sceneData.awaitReady();
sceneData.data.enabled; // synchronous
sceneData.get('enabled'); // same thing, keyed
await sceneData.set('enabled', true); // or set({ enabled: true })
```

For `CachedSceneMetadata`, `awaitReady()` only guarantees the constructor's first fetch has completed —
if no scene was open at that moment, that fetch resolves to the defaults, and there's no re-fetch when a
scene later loads; the cache only updates from then on via `OBR.scene.onMetadataChange`. Await
`awaitScene()` first if you need real scene data on first read.

## Misc

- `awaitReady()` — resolves once `OBR.isReady`.
- `awaitScene()` — resolves once a scene is loaded (instantly if one already is).

## Acknowledgements

The hex and axonometric grid math is built on the excellent writeups at
[Amit Patel's hexagonal grids page](http://www-cs-students.stanford.edu/~amitp/gameprog.html#hex) and
[Red Blob Games' hexagonal grids guide](https://www.redblobgames.com/grids/hexagons/). Thanks for
making this stuff so much easier to get right.
