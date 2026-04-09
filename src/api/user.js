// src/api/user.js
import { post, get } from '@/utils/request';

export async function registerApi(params) {
  const {
    idType,
    idCard,
    realName,
    birthday,
    gender,
    phoneNumber,
    verificationCode,
    nation,
    province,
    city,
    district,
    detailAddress,
    password,
    confirmPassword,
  } = params;
  const res = await post('/mobile/webRegister', {
    hospitalId: 'SZYBTQYQ',
    registerSource: 'H5',
    idType,
    idCard,
    realName,
    birthday,
    gender,
    phoneNumber,
    verificationCode,
    nation,
    province,
    city,
    district,
    detailAddress,
    password,
    confirmPassword,
  });
  if (res.code !== 200) {
    throw new Error(res.message || '注册失败');
  } else {
    return res.data;
  }
}

// 登录
export async function loginApi(params) {
  const { idCard, password, ...rest } = params;
  const res = await post('/mobile/miniProgramLogin', {
    loginType: 'web',
    hospitalId: 'SZYBTQYQ',
    idCard,
    password,
    ...rest,
  });
  if (res.code !== 200) {
    throw new Error(res.message || '登录失败');
  } else {
    return res.data;
  }
}

// 发送短信验证码
export async function sendYunMsgApi(params) {
  const { type, phone, ...rest } = params;
  const res = await post('/mobile/api/sendYunMsg', {
    type,
    phone,
    ...rest,
  });
  if (res.code !== 200) {
    throw new Error(res.message || '发送短信验证码失败');
  } else {
    return res.data;
  }
}

// api/dict/all 获取字典数据
export async function getDictDataApi() {
  const res = await get('/mobile/api/dict/all');
  if (res.code !== 200) {
    throw new Error(res.message || '获取字典数据失败');
  } else {
    return res.data;
  }
}
