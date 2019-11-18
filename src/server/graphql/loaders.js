import DataLoader from 'dataloader';
import { User } from './../db/models';

export default function createLoaders(loaderOptions) {
  const options = { cache: loaderOptions && loaderOptions.disableCache ? false : true };
  return {
  };
}

