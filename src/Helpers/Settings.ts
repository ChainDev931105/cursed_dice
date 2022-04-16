import {fetchDataUtil} from "./Helpers";
import ApiRoutes from "../ApiRoutes/ApiRoutes";

export async function getProgram() {
    const programKeyVal = await fetchDataUtil(ApiRoutes.getProgram);
    return programKeyVal?.value;
}

export async function getUrl() {
    const urlKeyVal = await fetchDataUtil(ApiRoutes.getUrl);
    return urlKeyVal?.value;
}


export async function getNetwork() {
    const networkKeyVal = await fetchDataUtil(ApiRoutes.getNetwork);
    return networkKeyVal?.value;
}