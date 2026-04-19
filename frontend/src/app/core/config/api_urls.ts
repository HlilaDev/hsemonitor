export const BASE_URL = "http://localhost:5000/" ;
export const URL_UPLOAD = "http://localhost:5000/uploads/"
export const BASE_API_URL = "http://localhost:5000/api"

export const API_URLS ={
    auth:{
    //Auth API
    register:`${BASE_API_URL}/auth/register`,
    login:`${BASE_API_URL}/auth/login`,
    logout:`${BASE_API_URL}/auth/logout`,
    me:`${BASE_API_URL}/auth/me`
    // verifyEmail:`${BASE_API_URL}/auth/verify-email`,
    },


      companies: `${BASE_API_URL}/companies`,
      displayMessages: `${BASE_API_URL}/display-messages`,




    //Users API
    users:{
    allusers:`${BASE_API_URL}/users/`,
    getUserById:`${BASE_API_URL}/users/`,
    editUser:`${BASE_API_URL}/users/`,
    deleteUser:`${BASE_API_URL}/users/`,
    getTeam:`${BASE_API_URL}/users/team`,
     },

         //Zones API
    zones:{
    allZones:`${BASE_API_URL}/zones/`,
    getZoneById:`${BASE_API_URL}/zones/`,
    editZone:`${BASE_API_URL}/zones/`,
    deleteZone:`${BASE_API_URL}/zones/`,
    getDevicesByZone: `${BASE_API_URL}/zones/`,
     },
//audits
     audits: {
  allAudits: `${BASE_API_URL}/audits/`,
  getAuditById: `${BASE_API_URL}/audits/`,
  addAudit: `${BASE_API_URL}/audits/`,
  editAudit: `${BASE_API_URL}/audits/`,
  deleteAudit: `${BASE_API_URL}/audits/`,
  addFinding: `${BASE_API_URL}/audits/`,
  updateFinding: `${BASE_API_URL}/audits/`,
  deleteFinding: `${BASE_API_URL}/audits/`,
},
 //incidentEvents
incidentEvents: {
  create: `${BASE_URL}/incident-events`,
  list: `${BASE_URL}/incident-events`,
  byId: (id: string) => `${BASE_URL}/incident-events/${id}`,
  update: (id: string) => `${BASE_URL}/incident-events/${id}`,
  resolve: (id: string) => `${BASE_URL}/incident-events/${id}/resolve`,
  delete: (id: string) => `${BASE_URL}/incident-events/${id}`,
},

    //Devices API
   devices: {
  allDevices: `${BASE_API_URL}/devices/`,
  getDeviceById: `${BASE_API_URL}/devices/`,
  addDevice: `${BASE_API_URL}/devices/`,
  editDevice: `${BASE_API_URL}/devices/`,
  deleteDevice: `${BASE_API_URL}/devices/`,
  deviceSensors: `${BASE_API_URL}/devices/`,

 restartDevice: `${BASE_API_URL}/devices/`,
  // optionnel: toggle status, etc...
},

   employees: {
  allEmployee: `${BASE_API_URL}/employees/`,
  getEmployeeById: `${BASE_API_URL}/employees/`,
  addEmployee: `${BASE_API_URL}/employees/`,
  editEmployee: `${BASE_API_URL}/employees/`,
  deleteEmployee: `${BASE_API_URL}/employees/`,
   getEmployeesByZone: `${BASE_API_URL}/employees/by-zone/`,
  // optionnel: toggle status, etc...
},

// observation
observations: {
  create: `${BASE_API_URL}/observations`,
  list: `${BASE_API_URL}/observations`,
  byId: (id: string) => `${BASE_API_URL}/observations/${id}`,
  update: (id: string) => `${BASE_API_URL}/observations/${id}`,
  delete: (id: string) => `${BASE_API_URL}/observations/${id}`,
  assign: (id: string) => `${BASE_API_URL}/observations/${id}/assign`,
  resolve: (id: string) => `${BASE_API_URL}/observations/${id}/resolve`,
  validate: (id: string) => `${BASE_API_URL}/observations/${id}/validate`,
  reject: (id: string) => `${BASE_API_URL}/observations/${id}/reject`,
  addImage: (id: string) => `${BASE_API_URL}/observations/${id}/images`,
  totalCountByAgent: (agentId: string) =>
    `${BASE_API_URL}/observations/agent/${agentId}/count`,
},

  upload: {
  images: `${BASE_API_URL}/upload`,
},
// Sensors API
sensors: {
  allSensors: `${BASE_API_URL}/sensors/`,
  getSensorById: `${BASE_API_URL}/sensors/`,      // + id
  addSensor: `${BASE_API_URL}/sensors/`,
  editSensor: `${BASE_API_URL}/sensors/`,         // + id
  deleteSensor: `${BASE_API_URL}/sensors/`,       // + id
  updateStatus: (id: string) => `${BASE_API_URL}/sensors/${id}/status`,
},

//trainings
 trainings: {
    allTrainings: `${BASE_API_URL}/trainings/`,
    getTrainingById: (id: string) => `${BASE_API_URL}/trainings/${id}`,
    createTraining: `${BASE_API_URL}/trainings/`,
    editTraining: (id: string) => `${BASE_API_URL}/trainings/${id}`,
    deleteTraining: (id: string) => `${BASE_API_URL}/trainings/${id}`,
    addParticipant: (id: string) => `${BASE_API_URL}/trainings/${id}/participants`,
    updateParticipant: (id: string, participantId: string) => `${BASE_API_URL}/trainings/${id}/participants/${participantId}`,
    removeParticipant: (id: string, participantId: string) => `${BASE_API_URL}/trainings/${id}/participants/${participantId}`,
  },

  // Checklists API
checklists: {
  allTemplates: `${BASE_API_URL}/checklists/templates`,
  getTemplateById: (id: string) => `${BASE_API_URL}/checklists/templates/${id}`,
  addTemplate: `${BASE_API_URL}/checklists/templates`,
  editTemplate: (id: string) => `${BASE_API_URL}/checklists/templates/${id}`,
  deleteTemplate: (id: string) => `${BASE_API_URL}/checklists/templates/${id}`,

  addItemToTemplate: (templateId: string) =>
    `${BASE_API_URL}/checklists/templates/${templateId}/items`,
  editItem: (itemId: string) => `${BASE_API_URL}/checklists/items/${itemId}`,
  deleteItem: (itemId: string) => `${BASE_API_URL}/checklists/items/${itemId}`,

  allExecutions: `${BASE_API_URL}/checklists/executions`,
  getExecutionById: (id: string) =>
    `${BASE_API_URL}/checklists/executions/${id}`,
  startExecution: `${BASE_API_URL}/checklists/executions`,
  editExecution: (id: string) =>
    `${BASE_API_URL}/checklists/executions/${id}`,
  saveResponse: (executionId: string) =>
    `${BASE_API_URL}/checklists/executions/${executionId}/responses`,
  completeExecution: (id: string) =>
    `${BASE_API_URL}/checklists/executions/${id}/complete`,
},

  // Reports API
  reports: {
    create: `${BASE_API_URL}/reports`,
    list: `${BASE_API_URL}/reports`,
    byId: (id: string) => `${BASE_API_URL}/reports/${id}`,
    update: (id: string) => `${BASE_API_URL}/reports/${id}`,
    updateMetrics: (id: string) => `${BASE_API_URL}/reports/${id}/metrics`,
    delete: (id: string) => `${BASE_API_URL}/reports/${id}`,
  },

  // PPE Alerts API
ppeAlerts: {
  list: `${BASE_API_URL}/ppe-alerts`,
  stats: `${BASE_API_URL}/ppe-alerts/stats`,
  byId: (id: string) => `${BASE_API_URL}/ppe-alerts/${id}`,
  updateStatus: (id: string) => `${BASE_API_URL}/ppe-alerts/${id}/status`,
  delete: (id: string) => `${BASE_API_URL}/ppe-alerts/${id}`,
    uploadSnapshot: `${BASE_API_URL}/ppe-alerts/upload-snapshot`,
},

  // readings
readings: {
  list: `${BASE_API_URL}/readings`, // liste paginée + filtres

  byId: (id: string) => `${BASE_API_URL}/readings/${id}`,

  latestByDevice: (deviceId: string) =>
    `${BASE_API_URL}/readings/latest/device/${deviceId}`,

  historyByDevice: (deviceId: string) =>
    `${BASE_API_URL}/readings/history/device/${deviceId}`,

  latestByZone: (zoneId: string) =>
    `${BASE_API_URL}/readings/latest/zone/${zoneId}`,
},

// notifications globales
notifications: {
  dispatch: `${BASE_API_URL}/notifications/dispatch`,
  all: `${BASE_API_URL}/notifications/`,
  byId: `${BASE_API_URL}/notifications/`,
  deleteGlobal: `${BASE_API_URL}/notifications/`,
},

// notifications de l'utilisateur connecté
userNotifications: {
  all: `${BASE_API_URL}/user-notifications/`,
  unreadCount: `${BASE_API_URL}/user-notifications/unread-count`,
  markAsRead: `${BASE_API_URL}/user-notifications/`,
  markAllAsRead: `${BASE_API_URL}/user-notifications/read-all`,
  delete: `${BASE_API_URL}/user-notifications/`,
},


  inventory: {
    items: {
      all: `${BASE_API_URL}/inventory/items`,
      create: `${BASE_API_URL}/inventory/items`,
      byId: (id: string) => `${BASE_API_URL}/inventory/items/${id}`,
      update: (id: string) => `${BASE_API_URL}/inventory/items/${id}`,
      delete: (id: string) => `${BASE_API_URL}/inventory/items/${id}`,
      updateStatus: (id: string) => `${BASE_API_URL}/inventory/items/${id}/status`,
      assign: (id: string) => `${BASE_API_URL}/inventory/items/${id}/assign`,
      unassign: (id: string) => `${BASE_API_URL}/inventory/items/${id}/unassign`,
      stats: `${BASE_API_URL}/inventory/items/stats`,
      expired: `${BASE_API_URL}/inventory/items/expired`,
      lowStock: `${BASE_API_URL}/inventory/items/low-stock`,
    },

    movements: {
      all: `${BASE_API_URL}/inventory/movements`,
      create: `${BASE_API_URL}/inventory/movements`,
      byId: (id: string) => `${BASE_API_URL}/inventory/movements/${id}`,
      delete: (id: string) => `${BASE_API_URL}/inventory/movements/${id}`,
    },

    assignments: {
      all: `${BASE_API_URL}/inventory/assignments`,
      create: `${BASE_API_URL}/inventory/assignments`,
      byId: (id: string) => `${BASE_API_URL}/inventory/assignments/${id}`,
      return: (id: string) => `${BASE_API_URL}/inventory/assignments/${id}/return`,
      updateStatus: (id: string) => `${BASE_API_URL}/inventory/assignments/${id}/status`,
      delete: (id: string) => `${BASE_API_URL}/inventory/assignments/${id}`,
    },

    inspections: {
      all: `${BASE_API_URL}/inventory/inspections`,
      create: `${BASE_API_URL}/inventory/inspections`,
      byId: (id: string) => `${BASE_API_URL}/inventory/inspections/${id}`,
      update: (id: string) => `${BASE_API_URL}/inventory/inspections/${id}`,
      delete: (id: string) => `${BASE_API_URL}/inventory/inspections/${id}`,
    },
  },

}
