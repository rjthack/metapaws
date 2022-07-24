type BasePet = {
  id: number;
  series: string;
  owner: string;
};

type HungryPug = BasePet & {
  series: 'HUNGRY_PUG';
  baseColor: string;
  secondaryColor: string;
  tongueColor: string;
  strokeColor: string;
};

export type Pet = HungryPug;
