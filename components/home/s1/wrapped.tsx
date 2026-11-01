"use client";

import { withHomeData } from "../HomeDataContext";
import { Hero as HeroImpl } from "./Hero";
import { FindCoordinates as FindCoordinatesImpl } from "./FindCoordinates";
import { HomeAtlas as HomeAtlasImpl } from "./HomeAtlas";
import { ArchitectureInMotion as ArchitectureInMotionImpl } from "./ArchitectureInMotion";
import { CityFloorPlan as CityFloorPlanImpl } from "./CityFloorPlan";
import { HomesByCharacter as HomesByCharacterImpl } from "./HomesByCharacter";
import { DifferentPerspective as DifferentPerspectiveImpl } from "./DifferentPerspective";

export const Hero = withHomeData(HeroImpl);
export const FindCoordinates = withHomeData(FindCoordinatesImpl);
export const HomeAtlas = withHomeData(HomeAtlasImpl);
export const ArchitectureInMotion = withHomeData(ArchitectureInMotionImpl);
export const CityFloorPlan = withHomeData(CityFloorPlanImpl);
export const HomesByCharacter = withHomeData(HomesByCharacterImpl);
export const DifferentPerspective = withHomeData(DifferentPerspectiveImpl);
