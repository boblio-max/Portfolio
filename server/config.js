// Central tracking configuration. Edit these lists to change what the
// portfolio tracks, features, or classifies as hardware. No code changes needed.
export const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'boblio-max';

// Every tracked repository. `name` is the local key (lowercase match).
// `owner`/`repo` are the real GitHub coordinates — do not invent these.
export const TRACKED = [
  { name: 'bluetooth-rfcomm-chat', owner: 'boblio-max', repo: 'bluetooth-rfcomm-chat' },
  { name: 'brain-simulation-framework', owner: 'boblio-max', repo: 'brain-simulation-framework' },
  { name: 'calculus-origin-lib', owner: 'boblio-max', repo: 'Calculus-origin-lib' },
  { name: 'claw-code', owner: 'ultraworkers', repo: 'claw-code' }, // fork from ultraworkers
  { name: 'codrive', owner: 'boblio-max', repo: 'CoDrive' },
  { name: 'cori_2.0', owner: 'boblio-max', repo: 'cori_2.0' },
  { name: 'cori-main', owner: 'boblio-max', repo: 'CORI-main' },
  { name: 'cori-robot-arm-control', owner: 'boblio-max', repo: 'cori-robot-arm-control' }, // local remote shows c.o.r.i alias
  { name: 'cpu-arch', owner: 'boblio-max', repo: 'cpu-arch' },
  { name: 'cricket-bat-sensor', owner: 'boblio-max', repo: 'cricket-bat-sensor' },
  { name: 'cricket-player-insights', owner: 'boblio-max', repo: 'cricket-player-insights' },
  { name: 'docs.origin', owner: 'boblio-max', repo: 'docs.origin' },
  { name: 'dplumb-data-pipe', owner: 'boblio-max', repo: 'dplumb-data-pipe' },
  { name: 'experiments', owner: 'boblio-max', repo: 'experiments' },
  { name: 'finance_thing', owner: 'boblio-max', repo: 'finance_thing' },
  { name: 'folder_gen', owner: 'boblio-max', repo: 'folder_gen' },
  { name: 'gazebo-sim-benchmark', owner: 'boblio-max', repo: 'gazebo-sim-benchmark' },
  { name: 'graph-origin-lib', owner: 'boblio-max', repo: 'graph-origin-lib' },
  { name: 'inorigin', owner: 'boblio-max', repo: 'inorigin' },
  { name: 'lib-collection', owner: 'boblio-max', repo: 'lib-collection' },
  { name: 'llm-cad-agent', owner: 'boblio-max', repo: 'llm-cad-agent' },
  { name: 'logor-regression-backend', owner: 'boblio-max', repo: 'logor-regression-backend' },
  { name: 'logor-testing-website', owner: 'boblio-max', repo: 'logor-testing-website' },
  { name: 'monday-voice-assistant', owner: 'boblio-max', repo: 'monday-voice-assistant' },
  { name: 'n-python', owner: 'boblio-max', repo: 'n-python' },
  { name: 'orbs-ball-robot', owner: 'boblio-max', repo: 'ORBS-ball-robot' }, // local remote shows rpi-ball-robot-pid alias
  { name: 'origin_java', owner: 'boblio-max', repo: 'origin_java' },
  { name: 'origin_transformer_wrapper', owner: 'boblio-max', repo: 'Origin_transformer_wrapper' },
  { name: 'origin-codegen-model-inorigin', owner: 'boblio-max', repo: 'origin-codegen-model-inorigin' },
  { name: 'origin-codegen-model', owner: 'boblio-max', repo: 'origin-codegen-model' },
  { name: 'origin-dev', owner: 'boblio-max', repo: 'origin-dev' },
  { name: 'origin-web', owner: 'boblio-max', repo: 'origin-web' },
  { name: 'origin', owner: 'boblio-max', repo: 'origin' },
  { name: 'origindevtools', owner: 'boblio-max', repo: 'origindevtools' },
  { name: 'originos', owner: 'boblio-max', repo: 'originos' },
  { name: 'ospr', owner: 'boblio-max', repo: 'ospr' },
  { name: 'portfolio', owner: 'boblio-max', repo: 'Portfolio' }, // this website itself
  { name: 'push-to-talk-code-assistant', owner: 'boblio-max', repo: 'push-to-talk-code-assistant' },
  { name: 'python-java-connect', owner: 'boblio-max', repo: 'python-java-connect' },
  { name: 'questrobotics-cad', owner: 'boblio-max', repo: 'questrobotics-cad' },
  { name: 'qyphos-quantum-simulator', owner: 'boblio-max', repo: 'qyphos-quantum-simulator' },
  { name: 'sims', owner: 'boblio-max', repo: 'sims' },
  { name: 'supabot-llm-toolkit', owner: 'boblio-max', repo: 'supabot-llm-toolkit' },
  { name: 'swarm-robot-orchestrator', owner: 'boblio-max', repo: 'swarm-robot-orchestrator' },
  { name: 'vogyr-carpooling', owner: 'boblio-max', repo: 'vogyr-carpooling' },
];
// NOTE: opencode_python is intentionally excluded — it is not a git repository.

// Category tags per repository (keys are lowercase `name`). Easy to extend.
export const CATEGORIES = {
  'orbs-ball-robot': ['hardware', 'robotics'],
  'cori_2.0': ['hardware', 'robotics'],
  'cori-main': ['hardware', 'robotics'],
  'cori-robot-arm-control': ['hardware', 'robotics'],
  'codrive': ['hardware', 'robotics'],
  'cricket-bat-sensor': ['hardware', 'electronics'],
  'gazebo-sim-benchmark': ['hardware', 'simulation'],
  'questrobotics-cad': ['hardware', 'robotics'],
  'swarm-robot-orchestrator': ['hardware', 'robotics', 'ai'],
  origin: ['software', 'compiler', 'ai'],
  originos: ['software', 'systems'],
  ospr: ['ai', 'ml', 'research'],
  'qyphos-quantum-simulator': ['research', 'simulation'],
  'vogyr-carpooling': ['web'],
  'llm-cad-agent': ['ai', 'robotics'],
  'brain-simulation-framework': ['research', 'simulation'],
  'origin-codegen-model': ['ai', 'compiler'],
};

// Hardware view filter. Change this list to reclassify.
export const HARDWARE = new Set([
  'cori_2.0', 'cori-main', 'cori-robot-arm-control', 'codrive',
  'orbs-ball-robot', 'cricket-bat-sensor', 'gazebo-sim-benchmark',
  'questrobotics-cad', 'swarm-robot-orchestrator',
]);

// Featured projects. One project may later map to several repos via `repos[]`.
// `status` is curated (no fake percentages). Descriptions fall back to GitHub
// repo descriptions when `description` is empty.
export const FEATURED = [
  { id: 'origin', name: 'Origin', status: 'In development', description: '', repos: ['origin'] },
  { id: 'originos', name: 'Origin OS', status: 'In development', description: '', repos: ['originos'] },
  { id: 'cori', name: 'CORI 2.0', status: 'Active', description: 'Competition robotics platform.', repos: ['cori_2.0'] },
  { id: 'orbs', name: 'ORBS', status: 'In development', description: 'Spherical omnidirectional robot.', repos: ['orbs-ball-robot'] },
  { id: 'ospr', name: 'OSPR', status: 'Research', description: '', repos: ['ospr'] },
  { id: 'qyphos', name: 'Qyphos', status: 'Research', description: '', repos: ['qyphos-quantum-simulator'] },
  { id: 'vogyr', name: 'Vogyr', status: 'Experimental', description: '', repos: ['vogyr-carpooling'] },
  { id: 'llm-cad-agent', name: 'LLM CAD Agent', status: 'Experimental', description: '', repos: ['llm-cad-agent'] },
  { id: 'swarm', name: 'Swarm Robot Orchestrator', status: 'Experimental', description: '', repos: ['swarm-robot-orchestrator'] },
];
