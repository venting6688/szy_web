// src/api/user.js
import { post, get } from '@/utils/request';
// 注册 /mobile/webRegister
// "hospitalId": "SZYBTQYQ",
// "registerSource": "H5",
// "idType": "01",
// "idCard": "370831199803111517",
// "realName": "张三",
// "birthday": "1999-09-10",
// "gender": "1",
// "phoneNumber": "15589796135",
// "verificationCode": "7397",
// "nation": "汉族",
// "province": "山东省",
// "city": "济南市",
// "district": "历城区",
// "detailAddress": "唐冶街道xxx小区1号楼1单元101",
// "password": "123456",
// "confirmPassword": "123456"

export function registerApi(params) {
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
  return post('/mobile/webRegister', {
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
}

export function createMemberApi(params) {
  const {
    relationship,
    nickname,
    realName,
    gender,
    birthday,
    phoneNumber,
    idCard,
    healthCardNo,
    ownerUserId,
    idNo,
    idType,
    patientName,
    patientType,
    phone,
    address,
    cardNo,
    cardType,
    qrCodeText,
    defaultPatient,
    contactName,
    contactIDNo,
    contactIDType,
    maritalStatus,
    nationality,
    nation,
    occupation,
    contactTelNo,
    verificationCode,
    hospitalId,
    ...rest
  } = params;
  return post('/api/member/create', {
    relationship: '本人',
    nickname: realName,
    realName,
    gender,
    birthday,
    phoneNumber,
    idCard,
    // healthCardNo,
    ownerUserId, // ??
    idNo: idCard,
    idType,
    patientName: realName,
    patientType: '01', // ??
    phone: phoneNumber,
    address,
    cardNo: idCard,
    cardType: idType, // ??
    qrCodeText,
    defaultPatient,
    contactName,
    contactIDNo,
    contactIDType,
    maritalStatus,
    nationality,
    nation,
    occupation,
    contactTelNo,
    verificationCode,
    hospitalId: 'SZYBTQYQ',
    ...rest,
  });
}

// 登录
export function loginApi(params) {
  const { idCard, password, ...rest } = params;
  return post('/mobile/miniProgramLogin', {
    loginType: 'web',
    hospitalId: 'SZYBTQYQ',
    idCard,
    password,
    ...rest,
  });
}

// 发送短信验证码
export function sendYunMsgApi(params) {
  const { type, phone, ...rest } = params;
  return post('/mobile/api/sendYunMsg', {
    type,
    phone,
    ...rest,
  });
}

// api/dict/all 获取字典数据
export function getDictDataApi() {
  return get('/mobile/api/dict/all');
}
