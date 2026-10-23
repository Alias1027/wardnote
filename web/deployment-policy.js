// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {STATIC_ONLY} from './deployment-profile.js';
export {STATIC_ONLY};
export const STATIC_NOTICE='本机独立版：资料保存在此设备；未部署联网工作区、云端识别或同步接口。';
export const STATIC_ERROR='此部署未提供联网服务；已保存的本机资料不受影响。';
export function requireNetworkDeployment(){if(STATIC_ONLY)throw new Error(STATIC_ERROR);}
