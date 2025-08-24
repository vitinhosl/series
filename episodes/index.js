import { animesData    } from './all/animes.js';
import { biblicalData  } from './all/biblicas.js';
import { channelData   } from './all/canais.js';
import { minecraftData } from './all/minecraft.js';
import { novelsData    } from './all/novelas.js';
import { seriesData    } from './all/series.js';
import { moviesData    } from './all/movies.js';

export { animesData, biblicalData, channelData, minecraftData, novelsData, seriesData, moviesData};

export const seriesAll = [
  ...biblicalData,
  ...seriesData,
  ...novelsData,
  ...channelData,
  ...animesData,
  ...minecraftData,
  // ...moviesData,
];
