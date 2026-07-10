import mainapi from 'api/mainapi';
import axios from 'axios';
import authservice from 'pages/authentication/services/authservice';

const USER_URL = mainapi.USER_API;
const BASE_URL = mainapi.USER_API;

const SettingService = {
  
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found. Please login again.');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  },

  // ==================== District Management APIs ====================
  
  async fetchDistricts() {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${BASE_URL}/user-access/api/it-admin/get-all`,
        { headers }
      );

      return response.data;
    } catch (err) {
      if (err.response?.status === 403) {
        throw new Error('Access denied. You don\'t have permission to view districts.');
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch districts');
    }
  },

  async saveDistrict(districtData) {
    try {
      const headers = this.getAuthHeaders();
      const userId = authservice.userid();
      const payload = {
        ...districtData,
        addedBy: userId,
        dist_lsg_code: Number(districtData.dist_lsg_code),
        des_dist_code: Number(districtData.des_dist_code),
      };
      const response = await axios.post(
        `${BASE_URL}/user-access/api/it-admin/saveDistrict`,
        payload,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) throw new Error('Access denied. You don\'t have permission to modify districts.');
      if (err.response?.status === 401) throw new Error('Session expired. Please login again.');
      throw new Error(err.response?.data?.message || err.message || 'Failed to save district');
    }
  },

  async toggleDistrictActive(district) {
    const updatedDistrict = { ...district, is_active: !district._active };
    return this.saveDistrict(updatedDistrict);
  },

  // ==================== District Office Management APIs ====================

  async fetchDistrictsForDropdown() {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${BASE_URL}/btr-service/admin-manage/districts`,
        { headers }
      );
      return response.data.map(district => ({
        dist_id: district.districtId,
        dist_name_en: district.districtNameEn,
        dist_name_mal: district.districtNameMal,
      }));
    } catch (err) {
      console.error("Error fetching districts:", err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch districts');
    }
  },

  async fetchDistrictsRaw() {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${BASE_URL}/btr-service/admin-manage/districts`,
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching districts:", err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch districts');
    }
  },

  async fetchDistrictOffices() {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${BASE_URL}/user-access/api/it-admin/getAllDistrictOffice`,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) {
        throw new Error('Access denied. You don\'t have permission to view district offices.');
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch district offices');
    }
  },

  async saveDistrictOffice(officeData) {
    try {
      const headers = this.getAuthHeaders();
      const userId = authservice.userid();
      console.log("Saving district office with data:", officeData, "and userId:", userId);
      const payload = {
        ...officeData,
        userId: userId,
      };
      const response = await axios.post(
        `${BASE_URL}/user-access/api/it-admin/saveDistrictOffice`,
        payload,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) throw new Error('Access denied. You don\'t have permission to modify district offices.');
      if (err.response?.status === 401) throw new Error('Session expired. Please login again.');
      if (err.response?.data?.message?.includes('duplicate')) throw new Error('A district office with this name already exists.');
      throw new Error(err.response?.data?.message || err.message || 'Failed to save district office');
    }
  },

  async toggleDistrictOfficeActive(office) {
    const updatedOffice = { 
      id: office.id,
      nameEn: office.nameEn,
      distId: office.distId,
      active: !office.active 
    };
    return this.saveDistrictOffice(updatedOffice);
  },

  // ==================== Taluk Management APIs ====================

  async fetchAllTaluks() {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${BASE_URL}/btr-service/admin-manage/getAllTaluk`,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) {
        throw new Error('Access denied. You don\'t have permission to view taluks.');
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch taluks');
    }
  },

  async fetchActiveTaluks() {
    try {
      const taluks = await this.fetchAllTaluks();
      return taluks.filter(taluk => taluk.active === true);
    } catch (err) {
      throw err;
    }
  },

  async saveTaluk(talukData) {
    try {
      const headers = this.getAuthHeaders();
      const userId = authservice.userid();
      const payload = {
        ...talukData,
        userId: userId,
      };
      const response = await axios.post(
        `${BASE_URL}/btr-service/admin-manage/saveOrUpdate`,
        payload,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) throw new Error('Access denied. You don\'t have permission to modify taluks.');
      if (err.response?.status === 401) throw new Error('Session expired. Please login again.');
      if (err.response?.data?.message?.includes('duplicate')) throw new Error('A taluk with this name already exists.');
      throw new Error(err.response?.data?.message || err.message || 'Failed to save taluk');
    }
  },

  async toggleTalukActive(taluk) {
    const updatedTaluk = {
      desTalukId: taluk.desTalukId,
      desTalukNameEn: taluk.desTalukNameEn,
      desTalukNameMal: taluk.desTalukNameMal,
      distId: taluk.distId,
      isActive: !taluk.active,
    };
    return this.saveTaluk(updatedTaluk);
  },

  // ==================== Taluk Office Management APIs ====================

  async fetchTalukOffices() {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${BASE_URL}/user-access/api/it-admin/getAllDesOffice`,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) {
        throw new Error('Access denied. You don\'t have permission to view taluk offices.');
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch taluk offices');
    }
  },

  async saveTalukOffice(officeData) {
    try {
      const headers = this.getAuthHeaders();
      const userId = authservice.userid();
      const payload = {
        ...officeData,
        userId: userId,
        distId: Number(officeData.distId),
        desTalukId: Number(officeData.desTalukId),
      };
      const response = await axios.post(
        `${BASE_URL}/user-access/api/it-admin/saveOrUpdateTalukOffice`,
        payload,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) throw new Error('Access denied. You don\'t have permission to modify taluk offices.');
      if (err.response?.status === 401) throw new Error('Session expired. Please login again.');
      if (err.response?.data?.message?.includes('duplicate')) throw new Error('A taluk office with this name already exists.');
      throw new Error(err.response?.data?.message || err.message || 'Failed to save taluk office');
    }
  },

  async toggleTalukOfficeActive(office) {
    const updatedOffice = {
      id: office.id,
      talukOfficeNameEn: office.talukOfficeNameEn,
      distId: office.distId,
      desTalukId: office.desTalukId,
      active: !office.active,
    };
    return this.saveTalukOffice(updatedOffice);
  },

  // ==================== Revenue Taluk Management APIs ====================

  async fetchRevenueTaluks() {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${BASE_URL}/btr-service/admin-manage/getAllRev`,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) {
        throw new Error('Access denied. You don\'t have permission to view revenue taluks.');
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch revenue taluks');
    }
  },

  async fetchActiveRevenueTaluks() {
    try {
      const taluks = await this.fetchRevenueTaluks();
      return taluks.filter(taluk => taluk.isActive === true);
    } catch (err) {
      throw err;
    }
  },

  async saveRevenueTaluk(talukData) {
    try {
      const headers = this.getAuthHeaders();
      const userId = authservice.userid();
      const payload = {
        ...talukData,
        userId: userId,
        lsgCode: Number(talukData.lsgCode),
        censusCode2001: talukData.censusCode2001 ? Number(talukData.censusCode2001) : null,
        censusCode2011: talukData.censusCode2011 || "",
      };
      const response = await axios.post(
        `${BASE_URL}/btr-service/admin-manage/saveOrUpdateRev`,
        payload,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) throw new Error('Access denied. You don\'t have permission to modify revenue taluks.');
      if (err.response?.status === 401) throw new Error('Session expired. Please login again.');
      if (err.response?.data?.message?.includes('duplicate')) throw new Error('A revenue taluk with this name already exists.');
      throw new Error(err.response?.data?.message || err.message || 'Failed to save revenue taluk');
    }
  },

  async toggleRevenueTalukActive(taluk) {
    const updatedTaluk = {
      revTalukId: taluk.revTalukId,
      revTalukNameEn: taluk.revTalukNameEn,
      revTalukNameMal: taluk.revTalukNameMal,
      distId: taluk.distId,
      isActive: !taluk.isActive,
      lsgCode: taluk.lsgCode,
      censusCode2001: taluk.censusCode2001,
      censusCode2011: taluk.censusCode2011,
      talukCodeApi: taluk.talukCodeApi,
    };
    return this.saveRevenueTaluk(updatedTaluk);
  },

  // ==================== Village Management APIs ====================

  async fetchAllVillages() {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${BASE_URL}/btr-service/admin-manage/getAllMasterVillage`,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) {
        throw new Error('Access denied. You don\'t have permission to view villages.');
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch villages');
    }
  },

  async saveVillage(villageData) {
    try {
      const headers = this.getAuthHeaders();
      const userId = authservice.userid();
      const payload = {
        ...villageData,
        userId: userId,
        lsgCode: Number(villageData.lsgCode),
      };
      const response = await axios.post(
        `${BASE_URL}/btr-service/admin-manage/saveOrUpdateMasterVillage`,
        payload,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) throw new Error('Access denied. You don\'t have permission to modify villages.');
      if (err.response?.status === 401) throw new Error('Session expired. Please login again.');
      if (err.response?.data?.message?.includes('duplicate')) throw new Error('A village with this name already exists.');
      throw new Error(err.response?.data?.message || err.message || 'Failed to save village');
    }
  },

  async toggleVillageActive(village) {
    const updatedVillage = {
      villageId: village.villageId,
      villageNameEn: village.villageNameEn,
      villageNameMal: village.villageNameMal,
      revTalukId: village.revTalukId,
      isActive: !village.isActive,
      villageCodeApi: village.villageCodeApi,
      lsgCode: village.lsgCode,
      censusCode2001: village.censusCode2001,
      censusCode2011: village.censusCode2011,
    };
    return this.saveVillage(updatedVillage);
  },

  // ==================== Village Block Management APIs ====================

  async fetchAllVillageBlocks() {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${BASE_URL}/btr-service/admin-manage/getAllVillageBlock`,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) {
        throw new Error('Access denied. You don\'t have permission to view village blocks.');
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch village blocks');
    }
  },

  async saveVillageBlock(blockData) {
    try {
      const headers = this.getAuthHeaders();
      const userId = authservice.userid();
      const payload = {
        ...blockData,
        userId: userId,
        villageId: Number(blockData.villageId),
      };
      const response = await axios.post(
        `${BASE_URL}/btr-service/admin-manage/saveOrUpdateVillageBlock`,
        payload,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) throw new Error('Access denied. You don\'t have permission to modify village blocks.');
      if (err.response?.status === 401) throw new Error('Session expired. Please login again.');
      if (err.response?.data?.message?.includes('duplicate')) throw new Error('A village block with this code already exists.');
      throw new Error(err.response?.data?.message || err.message || 'Failed to save village block');
    }
  },

  async toggleVillageBlockActive(block) {
    const updatedBlock = {
      villageBlockId: block.villageBlockId,
      blockCode: block.blockCode,
      villageId: block.villageId,
      isActive: !block.isActive,
    };
    return this.saveVillageBlock(updatedBlock);
  },

  // ==================== Local Body Management APIs ====================

  async fetchAllLocalBodies() {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${BASE_URL}/btr-service/admin-manage/getAllLocalBody`,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) {
        throw new Error('Access denied. You don\'t have permission to view local bodies.');
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch local bodies');
    }
  },

  async saveLocalBody(localBodyData) {
    try {
      const headers = this.getAuthHeaders();
      const userId = authservice.userid();
      const payload = {
        ...localBodyData,
        userId: userId,
        distId: Number(localBodyData.distId),
        localbodyType: Number(localBodyData.localbodyType),
      };
      const response = await axios.post(
        `${BASE_URL}/btr-service/admin-manage/saveOrUpdateLocalBody`,
        payload,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) throw new Error('Access denied. You don\'t have permission to modify local bodies.');
      if (err.response?.status === 401) throw new Error('Session expired. Please login again.');
      if (err.response?.data?.message?.includes('duplicate')) throw new Error('A local body with this code already exists.');
      throw new Error(err.response?.data?.message || err.message || 'Failed to save local body');
    }
  },

  async toggleLocalBodyActive(localBody) {
    const updatedLocalBody = {
      ...localBody,
      isActive: !localBody.isActive,
    };
    return this.saveLocalBody(updatedLocalBody);
  },

  // ==================== Master Block Management APIs ====================

  async fetchAllMasterBlocks() {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${BASE_URL}/btr-service/admin-manage/getAllMasterBlock`,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) {
        throw new Error('Access denied. You don\'t have permission to view master blocks.');
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch master blocks');
    }
  },

  async saveMasterBlock(blockData) {
    try {
      const headers = this.getAuthHeaders();
      const userId = authservice.userid();
      const payload = {
        ...blockData,
        userId: userId,
        district: Number(blockData.district),
        lsgCode: Number(blockData.lsgCode),
      };
      const response = await axios.post(
        `${BASE_URL}/btr-service/admin-manage/saveOrUpdateBlock`,
        payload,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) throw new Error('Access denied. You don\'t have permission to modify master blocks.');
      if (err.response?.status === 401) throw new Error('Session expired. Please login again.');
      if (err.response?.data?.message?.includes('duplicate')) throw new Error('A block with this code already exists.');
      throw new Error(err.response?.data?.message || err.message || 'Failed to save master block');
    }
  },

  async toggleMasterBlockActive(block) {
    const updatedBlock = {
      ...block,
      valid: !block.valid,
    };
    return this.saveMasterBlock(updatedBlock);
  },

  // ==================== Master Zone Management APIs ====================

async fetchAllMasterZones() {
  try {
    const headers = this.getAuthHeaders();
    const response = await axios.get(
      `${BASE_URL}/btr-service/admin-manage/getAllMasterZone`,
      { headers }
    );
    return response.data;
  } catch (err) {
    if (err.response?.status === 403) {
      throw new Error('Access denied. You don\'t have permission to view master zones.');
    }
    throw new Error(err.response?.data?.message || err.message || 'Failed to fetch master zones');
  }
},

async saveMasterZone(zoneData) {
  try {
    const headers = this.getAuthHeaders();
    const userId = authservice.userid();
    const payload = {
      ...zoneData,
      userId: userId,
      desTalukId: Number(zoneData.desTalukId),
      distId: Number(zoneData.distId),
      btrTypeId: Number(zoneData.btrTypeId),
    };
    const response = await axios.post(
      `${BASE_URL}/btr-service/admin-manage/saveOrUpdateMasterZone`,
      payload,
      { headers }
    );
    return response.data;
  } catch (err) {
    if (err.response?.status === 403) throw new Error('Access denied. You don\'t have permission to modify master zones.');
    if (err.response?.status === 401) throw new Error('Session expired. Please login again.');
    if (err.response?.data?.message?.includes('duplicate')) throw new Error('A zone with this name already exists.');
    throw new Error(err.response?.data?.message || err.message || 'Failed to save master zone');
  }
},

async toggleMasterZoneActive(zone) {
  const updatedZone = {
    zoneId: zone.zoneId,
    zoneNameEn: zone.zoneNameEn,
    zoneNameMal: zone.zoneNameMal,
    desTalukId: zone.desTalukId,
    distId: zone.distId,
    btrTypeId: zone.btrTypeId,
    isActive: !zone.isActive,
  };
  return this.saveMasterZone(updatedZone);
}

};

export default SettingService;