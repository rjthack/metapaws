import { BigNumber } from 'ethers';
import { Pet } from '../types/Pet';
import seedrandom from 'seedrandom';
import { Blend, Hct } from '@material/material-color-utilities';

function hctToHex(hct: Hct): string {
  function getHexColor(color: number) {
    return '#' + (color >>> 0).toString(16).slice(-6);
  }

  return getHexColor(hct.toInt());
}

export function getPetFromId(tokenId: number | BigNumber): Omit<Pet, 'owner'> {
  const random = (min: number, max: number) => {
    return rng() * (max - min) + min;
  };
  const rng = seedrandom(tokenId + '');
  const tokenIdNumber =
    tokenId instanceof BigNumber ? tokenId.toNumber() : tokenId;

  const mainColor = Hct.from(random(0, 360), random(10, 80), random(60, 80));

  // The color at the bottom is a diminished, slightly hue-deviated version of the top color
  const baseColor = Hct.from(
    mainColor.hue + random(-20, 20),
    random(0, mainColor.chroma - 10),
    random(mainColor.tone + 10, mainColor.tone + 30)
  );

  const strokeColor = Hct.from(mainColor.hue, mainColor.chroma, 10);

  const baseTongueColor = Hct.from(
    random(0, 20),
    random(30, 80),
    random(mainColor.tone - 20, mainColor.tone + 20)
  );
  const harmonizedTongueColor = Hct.fromInt(
    Blend.harmonize(baseTongueColor.toInt(), mainColor.toInt())
  );

  return {
    id: tokenIdNumber,
    series: 'HUNGRY_PUG',
    baseColor: hctToHex(baseColor),
    secondaryColor: hctToHex(mainColor),
    tongueColor: hctToHex(harmonizedTongueColor),
    strokeColor: hctToHex(strokeColor),
  };
}
