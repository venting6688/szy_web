// src/api/user.js
import { MessagePlugin } from 'tdesign-vue-next';
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
  const { code, msg, data } = await post('/mobile/webRegister', {
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
  if (code !== 200) {
    throw new Error(msg || '注册失败');
  } else {
    return data;
  }
}

// 登录
export async function loginApi(params) {
  const { idCard, password, ...rest } = params;
  const { code, msg, data } = await post('/mobile/miniProgramLogin', {
    loginType: 'web',
    hospitalId: 'SZYBTQYQ',
    idCard,
    password,
    ...rest,
  });
  if (code !== 200) {
    MessagePlugin.error(msg || '登录失败');
    throw new Error(msg || '登录失败');
  } else {
    return data;
  }
}

// 发送短信验证码
export async function sendYunMsgApi(params) {
  const { type, phone, ...rest } = params;
  const { code, msg, data } = await post('/mobile/api/sendYunMsg', {
    type,
    phone,
    ...rest,
    MessagePlugin.error(res.message || '发送短信验证码失败');
  });
  if (code !== 200) {
    MessagePlugin.error(msg || '发送短信验证码失败');
  } else {
    return data;
  }
}

// api/dict/all 获取字典数据
export async function getDictDataApi() {
  const { code, msg, data } = await get('/mobile/api/dict/all');
  if (code !== 200) {
    MessagePlugin.error(msg || '获取字典数据失败');
    throw new Error(msg || '获取字典数据失败');
  } else {
    return data;
  }
}
