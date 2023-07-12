import { EventObservation } from '../../types';
import { GerminatedIcon } from './GerminatedIcon';
import { HarvestedIcon } from './HarvestedIcon';
import { PlantedIcon } from './PlantedIcon';
import { WateredIcon } from './WateredIcon';
import { WeededIcon } from './WeededIcon';
import { PrunedIcon } from './PrunedIcon';
import { FertilizedIcon } from './FertilizedIcon';
import { SprayedIcon } from './SprayedIcon';
import { PhotographedIcon } from './PhotographedIcon';

export const iconByEventType: Record<
    EventObservation['type'],
    React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
    planted: PlantedIcon,
    germinated: GerminatedIcon,
    harvested: HarvestedIcon,
    weeded: WeededIcon,
    watered: WateredIcon,
    pruned: PrunedIcon,
    sprayed: SprayedIcon,
    fertilised: FertilizedIcon,
    photographed: PhotographedIcon,
};
