export interface SampleScript {
  id: string;
  title: string;
  genre: string;
  logline: string;
  text: string;
}

export const SAMPLE_SCRIPTS: SampleScript[] = [
  {
    id: 'cyberpunk-neon-eclipse',
    title: 'NEON ECLIPSE',
    genre: 'Cyberpunk Neo-Noir',
    logline: 'In the drenched lower tiers of Neo-Shinjuku, a disgraced cyber-detective tracks a memory courier holding the last fragment of uncorrupted synthetic conscience.',
    text: `EXT. NEO-SHINJUKU - LOWER SECTOR 4 - NIGHT

Heavy acid rain hammers the iridescent asphalt. Towering holographic billboards bleed magenta and cyan into the oily puddles. Steam hisses violently from sewer grates.

KAIEN (40s), trench coat frayed at the collar, high-collar cybernetic optical implant blinking amber, steps out from the shadows of an alleyway.

He presses two fingers to his temple. The optical HUD whirs to life.

                  KAIEN
            (sub-vocal comms)
        Oracle, I have visual on the drop point.
        No signs of Arasaka patrols yet.

Across the street, beneath the flickering neon sign of "BAR ZERO", a hooded figure—VAL (20s)—clutches a chrome cryogenic briefcase to her chest. Her breath fogs the damp air.

She glances over her shoulder. An armed autonomous quad-drone emerges slowly from the fog above, its searchlight sweeping across the alley walls.

                  VAL
            (panicked whisper)
        They're already here, Kaien!

Kaien draws a heavy kinetic magnum from beneath his coat.

                  KAIEN
        Stay low. When the searchlight sweeps past,
        run for the subway stairwell.

The searchlight snaps onto Val. Red laser targets paint her chest.

Kaien raises the magnum. A deafening crack echoes through the canyon of skyscrapers.`,
  },
  {
    id: 'scifi-orbital-station',
    title: 'THE DEEP ARCHIVE',
    genre: 'Sci-Fi Psychological Suspense',
    logline: 'An astrobiologist aboard a derelict Jupiter orbital observatory awakens to find the cryogenic vault cracked open from the inside.',
    text: `INT. JUPITER ORBITAL STATION "PROMETHEUS" - VAULT CORRIDOR - CYCLE 842

Emergency red strobe lights pulse in silence through the long, pressurized titanium corridor. Frost clings to the bulkhead seams.

DR. ELENA VANCE (30s), wearing an unlatched pressure suit and magnetic boots, steps cautiously down the metal grid walkway. Her flashlight beam cuts through floating crystalline ice particles.

Through the observation port on her left: the massive, swirling crimson eye of Jupiter fills the void, glowing with ominous majesty.

                  ELENA
            (breathing heavily)
        Archive Core, report status on Cryo-Chamber Seven.

The station intercom crackles with static.

                  ARCHIVE CORE (V.O.)
            (synthesized voice, distorted)
        Chamber Seven pressure dropped sixty seconds ago.
        Biometric signature... undetermined.

Elena reaches the heavy blast door. The thick reinforced glass has spider-webbed fractures radiating outward from the center.

She leans in. Her flashlight illuminates the empty, steaming interior of Chamber Seven.

On the interior glass: a smeared palm print, far too elongated to be human.

                  ELENA
        My God... it didn't die in the core.`,
  },
  {
    id: 'western-dust-and-iron',
    title: 'THE LAST TRAIN AT HIGH NOON',
    genre: 'Cinematic Neo-Western',
    logline: 'Two rival gunslingers wait at a sun-scorched frontier railway depot for a shipment of stolen federal gold.',
    text: `EXT. DUST DEVIL DEPOT - DAY

Sun beats down mercilessly on the cracked desert alkali flats. A rusted wind turbine creaks with every gust of dry wind. Heat shimmers warp the distant horizon.

COLT HOLLOWAY (50s), weather-beaten stetson tilted low over stone-cold eyes, leans against the wooden depot post, gently carving a piece of cedar with a hunting knife.

From the southern ridge, a solitary horseman approaches through the dust veil.

SILAS VANCE (30s), wearing a black duster and twin ivory-handled revolvers, dismounts smoothly. The spurs on his boots chime with each measured step.

Silas stops twenty paces away. The silence is thick, broken only by the buzz of cicadas.

                  SILAS
        You're sitting on the wrong bench, Holloway.
        The 12:15 belongs to the Blackwood outfit.

Holloway doesn't look up from his cedar carving. A thin curl of wood peels away.

                  COLT
        Train's five minutes out. That leaves you five
        minutes to turn that mare around and ride back
        to the border.

Silas's gloved hand hovers an inch above his right revolver holster.

In the far distance, a steam whistle screams. The train's black smoke plume rises against the blinding blue sky.`,
  },
];
