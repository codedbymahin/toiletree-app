import { Toilet } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  Submit: undefined;
  Profile: undefined;
  Admin: undefined;
};

export type GuestTabParamList = {
  Map: undefined;
  List: undefined;
  LoginWall: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  GuestTabs: undefined;
  Auth: undefined;
  ToiletDetails: { toiletId: string; toilet?: Toilet };
  ReportIssue: { toiletId: string; toiletName: string };
  ToiletList: {
    toilets?: Toilet[];
    bounds?: {
      minLat: number;
      maxLat: number;
      minLng: number;
      maxLng: number;
    };
  };
  Settings: undefined;
  About: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
  Team: undefined;
};

export type SubmitStackParamList = {
  SelectLocation: undefined;
  SubmitForm: { latitude: number; longitude: number };
};

