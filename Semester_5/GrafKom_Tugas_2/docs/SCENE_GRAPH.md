# Pohon Hubungan Objek

Pohon lengkap (tampak luar, interior, dan pameran) ditampilkan otomatis di halaman utama (bagian "Pohon hubungan objek"), dibaca langsung dari scene graph yang dirender (`src/ui/renderSceneTree.js`). Ringkasan di bawah mengikuti `src/models/building/ccwsBuilding.js` dan `src/models/exterior/environment.js`; node sejenis diringkas, dan `→` berarti "induk dari".

```text
Scene
├── Environment
│   ├── GroundZones          Lawn, Paving (tekstur foto), area tanah, CanopyPad, ShedPath, ConcretePipe0..3
│   ├── PalmCornerPivot      → PalmCornerTrunk, PalmCornerFrondPivot0..17 → PalmCornerFrond0..17   (pelepah bergoyang)
│   ├── Trees                → Tree…Pivot ×6 → Tree…Trunk, Tree…CrownPivot → cabang dan tajuk      (tajuk bergoyang)
│   ├── EastAnnex            gedung samping satu lantai (polos, atap pelana genteng)
│   ├── BackBuilding         gedung belakang dua lantai (polos) + Connector satu lantai
│   └── ParkingShed          → ShedRoof, ShedPost…, ShedFence → FenceFront/West/Back/East (pagar pipa biru, bukaan di ujung jalur paving)
├── People
│   ├── Sweeper → SweeperPelvis → Hip/Knee L/R, SweeperTorso → Shoulder/Elbow L/R, SweeperBroomPivot (sapu lidi)
│   └── VisitorA, VisitorB, VisitorC → …Pelvis → Hip…/Knee…, …Torso → Shoulder…/Elbow…, Head
└── CCWS
    ├── MainBlock
    │   ├── Walls
    │   ├── RoofGroup        → Roof (tekstur genteng + bump), RidgeCap
    │   └── GableWest, GableEast   (dinding segitiga, sejajar kemiringan atap)
    ├── FrontFacade          (bidang dinding depan, z = D/2)
    │   ├── PierLeft/Right, Fascia, FasciaJoint, FloorBand, Plinth (tekstur noda)
    │   ├── UpperGlazing0..2, UpperRoomBehind0..2, UpperTransom/Head/Sill0..2, UpperMullion0..23
    │   ├── FrontFacadeSash… ×21 (Pivot di engsel atas) → Glass, FrameTop/Bottom/Left/Right
    │   ├── GroundWindows0..3 (tekstur teralis) + GroundFrames0..3 → Mullion, Transom, Sill
    │   ├── Pebbles0..1, Grass0..1, FrontFacadePlanter0..5 → Pot, Soil, Leaf0..5 → LeafBlade, LeafTip
    │   ├── FrontFacadeDownpipe0..3 → Top, Neck, Main, Shoe, Bracket0..1
    │   └── Entrance
    │       ├── PortalWall…, PortalRoof, PortalFloor, PortalLamp
    │       ├── PortalSign, PortalSubtitle → Layer0..n   (huruf berlapis, alpha test)
    │       ├── EntranceWindowWest/East + EntranceFramesWest/East
    │       ├── DoorFrameHead/West/East, DoorTransom
    │       ├── MainDoorWestPivot, MainDoorEastPivot (di engsel) → Glass, Stile0..1, Rail0..1, Handle
    │       └── CheekWallWest/East, StepTopWest/BottomWest, Ramp, StepTopEast/BottomEast   (tangga – ramp – tangga)
    ├── BackFacade           (z = −D/2, fungsi yang sama diputar 180° pada sumbu Y; tanpa portal, bagian tengah tertutup penghubung ke gedung belakang)
    └── CoworkingEnd         (dinding gable barat, x = −L/2)
        ├── SlotWindow, SlotLouver0..3, CoworkingSign → Layer0..4
        ├── SideDoorFrame…, SideDoorBack, SideDoorNorthPivot, SideDoorSouthPivot (di engsel) → daun pintu
        ├── SideLanding, Sink, SinkTap
        └── Canopy
            ├── CanopySlab (segilima), CanopySlabBand, CanopyCeiling (tekstur plafon), CanopyLampInner/Outer
            ├── CanopyColumnNorth/South + CanopyArmNorth/South   (tiang menyambung jadi lengan miring, rangka ⌂)
            ├── BinPlatform
            ├── WheelieBin0..2 → Body, Rim, Handle, Axle, Wheel…, LidPivot (engsel belakang) → Lid
            └── BinRack → Shelf, Leg…, RailBack, PedalBin0..2 → Body, LidPivot → Lid, Knob
```

Interior dan pameran (`src/models/interior/interior.js`, `furniture.js`, `cafeCounter.js`, `exhibition.js`, `exhibits/*.js`) adalah anak `Scene` yang sejajar dengan `CCWS`:

```text
Scene
├── Interior
│   ├── FloorAndZones        Floor (kayu), ExhibitionZoneFloor, EntranceMat, ExhibitionWallPanel
│   ├── CeilingAndBeams      Ceiling, Beam0..5                (disembunyikan saat "Buka atap")
│   ├── WindowBays           FrontBay…/BackBay… → Pane, Frame…, Mullion…, Rail…; SideDoorBay
│   ├── WallBands, Mural     pita krem, kutipan (alpha test), lingkaran awan
│   ├── LightFixtures        Strip…, TrackNorth/South → Rail, Head…, Lens…
│   ├── WorkspaceFurniture   → Tables → Table0..7 → Top, Leg…, Stretcher, Screen
│   │                        → Chairs → Chair0..21 → Post, BaseA/B, Seat, Back, BackSupport
│   │                        → Sofas → SofaSouth/West, LoungeRug, LoungeTable
│   └── Cafe                 → Counter → FrontCounter/ReturnCounter/BackCounter (→ Crate…, CoffeeMachine, Sink, Kettle)
│                            → Shelves, Fridges, MenuBanner
├── CCWS
│   └── MainBlock → Walls → WallFront, WallBack, WallWest, WallEast   (dinding berongga dengan bukaan jendela dan pintu)
└── InnovationExhibition
    ├── TrainExhibitRoot     → MainCarriageBody, Roof, WindowGroups → Window0..1, DoorAssembly → DoorSlidePivot → DoorPanel,
    │                          DestinationDisplay (layar, nomor, pelat)
    ├── MotorcycleRoot       → DisplayPlatform, MotorcycleFrame → Chassis, BatteryPack, BodyPanels, Seat, HandlebarAssembly,
    │                          FrontFork, Swingarm, FrontWheelPivot → Tire, Rim, Hub, Spoke0..4, RearWheelPivot → …
    └── RobotArmRoot         → DisplayPlatform, PickableBox (anak GripperRoot saat dipegang)
                             → BaseVisual → BaseYawPivot → TurntableVisual → ShoulderPivot → UpperArmVisual
                               → ElbowPivot → ForearmVisual → WristPivot → GripperRoot → PalmVisual,
                                 LeftFingerPivot → LeftFingerVisual, RightFingerPivot → RightFingerVisual
```

Jumlah saat ini (dibaca dari scene yang berjalan): ±1.875 simpul dan ±1.540 mesh (Environment 209 simpul, CCWS 957, Interior 590, InnovationExhibition 119).

Matriks dunia anak = matriks dunia induk × matriks lokal anak, dengan matriks lokal = T · Rz · Ry · Rx · S (`src/webgl/mat4.js`, `src/webgl/sceneNode.js`).

- **Induk menggerakkan anak.** Menggeser `FrontFacade` atau `CoworkingEnd` ikut menggeser seluruh anaknya; inilah yang ditunjukkan tombol "Urai hierarki".
- **Satu fungsi, dua fasad.** `FrontFacade` dan `BackFacade` dibuat oleh fungsi yang sama; `BackFacade` hanya berbeda translasi dan rotasinya. Sisi belakang dibuat sama dengan depan berdasarkan informasi tim, karena tidak ada foto sisi belakang.
- **Pivot.** Setiap simpul `…Pivot` diletakkan di engsel, poros roda, atau pusat sendi robot. Animator hanya mengubah rotasi pivot itu (`src/world/animator.js`).
- **Atap dibuka.** Simpul dengan `visible = false` dilewati renderer beserta seluruh anaknya (`traverse`); dipakai untuk `RoofGroup` dan `CeilingAndBeams`.
