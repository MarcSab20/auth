// smpClient.ts
import { SMPClient, Persistence, defaultLanguage } from "smp-sdk-ts";
// import { services } from "./components/ui/serviceMocks";

const SMP_GRAPHQL_URL: string = "http://dev-gateway.sh1.hidora.net/graphql"; // URL de l'API GraphQL
// const SMP_GRAPHQL_URL: string = "http://localhost:4000/graphql";
const appId = "f2655ffda8594852";
const appSecret = "TA7Vin/JY0YIp9sGpiy6d7ade351Ub+Ia3Pj1acdMb7AxKL/t1vVCcXt6NSaEiTfYbCes1b4Qs8l54buR17oQdsP9p0lpx0ojKaSdjzER9ftagPpr/5byPZhyxsQNU/V9dzoIx4eVV2sSiuFq4XFNL48v6wZz3znX4IlLenGji8=";

const confOpts = {
  appId: appId,
  appSecret: appSecret,
  apiUrl: '',
  graphqlUrl: SMP_GRAPHQL_URL,
  defaultLanguage: defaultLanguage,
  appAccessDuration: 30, 
  userAccessDuration: 30, 
  minUserAccessDuration: 30, 
  minAppAccessDuration: 30, 
  persistence: Persistence.LocalStorageKind,
  storage: new Persistence(Persistence.LocalStorageKind),
};

const smpClient = new SMPClient(confOpts);

export const initializeSMPClient = async () => {
  try {
    const ra = await smpClient.getAppRefreshToken();
    if(!ra) {
      // await smpClient.authenticateApp();
      console.log("App should be authenticated");
    } else {
      // await smpClient.getAppAccessToken();
      console.log("App already authenticated");
    // }
    // const ru = await smpClient.getUserAccessToken();
    // if(!ru) {
    //   console.log("Need to authenticate user");
    // } else {
      // await smpClient.getUserAccessToken(); 
      console.log("User authenticated");
    }
  } catch (error) {
    console.error("Error initializing SMPClient:", error);
  }
};



export { smpClient };
