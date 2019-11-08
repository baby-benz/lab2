// This is a dummy content file for the Debug mode (set DEBUG in main.js to true)
// Android Example
window.PF = {
    Monitoring: {
        MM_CPUUSAGE: true,
        MM_CPUFREQ: true,
        MM_BATTERYLOAD: true,
        MM_BATTERYSTATE: true,
        MM_BATTERYTEMPERATURE: true,
        MM_RAMUSAGE: true,
        MM_WLANENABLED: true,
        MM_WLANIP: true,
        MM_WLANSSID: true,
        MM_WLANMACADRESS: true,
        MM_INTERNALCAPACITYUSED: true,
        MM_SDCAPACITYUSED: true,
        MM_EXTERNALDISKMOUNTED: true,
        MM_BLUETOOTHSTATUS: true
    },
    Apps: {
        MA_NAME: true,
        MA_INSTALL_DATE: true,
        MA_UPDATE_DATE: true,
        MA_VERSION_CODE: true,
        MA_VERSION_NAME: true,
        MA_SIZE: true,
        MA_CODE_SIZE: true,
        MA_DATA_SIZE: true,
        MA_CACHE_SIZE: true,
        MA_FUNC_GETICON: true,
        MA_FUNC_REMOVE_APPS: true
    },
    Processes: {
        MP_PID: true,
        MP_NAME: true,
        MP_MEMORY_USED: true,
        MP_SERVICE_COUNT: true,
        MP_TYPE: true,
        MP_STARTTIME: true,
        MP_FUNC_GETICON: true,
        MP_FUNC_STOPPROCESSES: true
    },
    SystemLog: {
        MSL_LOGLEVEL: true,
        MSL_PID: true,
        MSL_MSG: true,
        MSL_TIMESTAMP: true,
        MSL_PROCESSNAME: true
    },
    Settings: {
        WifiConfiguration: {
            MWC_NONE: false,
            MWC_SSID: true,
            MWC_ENCRYPTION_TYPE: true,
            MWC_PASSWORD: true,
            MWC_IDENTIFIER: true,
            MWC_OPEN: true,
            MWC_WEP: true,
            MWC_WPA_WPA2_PSK: true,
            MWC_GET_WIFI_CONFIGURATIONS: true,
            MWC_ADD_WIFI_CONFIGURATION: true,
            MWC_CHANGE_WIFI_CONFIGURATION: true,
            MWC_REMOVE_WIFI_CONFIGURATION: true
        },
        MailConfiguration: false,
        ExchangeConfiguration: false,
        MobileConfiguration: false
    },
    Screenshot: true,
    RemoteControl: true,
    ScreenSharing: true,
    FileTransfer: true,
    Nudge: true,
    Clipboard: true,
    Chat: true,
    TeamViewerRunning: false,
    Debug: true
};
// iOS Example
/*
window.PF = {
    Monitoring: {
        MM_CPUUSAGE: true,
        MM_CPUFREQ: true,
        MM_BATTERYLOAD: true,
        MM_BATTERYSTATE: true,
        MM_BATTERYTEMPERATURE: false,
        MM_RAMUSAGE: true,
        MM_WLANENABLED: true,
        MM_WLANIP: true,
        MM_WLANSSID: true,
        MM_WLANMACADRESS: true,
        MM_INTERNALCAPACITYUSED: true,
        MM_SDCAPACITYUSED: false,
        MM_EXTERNALDISKMOUNTED: false,
        MM_BLUETOOTHSTATUS: false
    },
    Apps: false,
    Processes: {
        MP_PID: true,
        MP_NAME: true,
        MP_MEMORY_USED: false,
        MP_SERVICE_COUNT: false,
        MP_TYPE: true,
        MP_STARTTIME: true,
        MP_FUNC_GETICON: false,
        MP_FUNC_STOPPROCESSES: false
    },
    SystemLog: {
        MSL_LOGLEVEL: true,
        MSL_PID: true,
        MSL_MSG: true,
        MSL_TIMESTAMP: true,
        MSL_PROCESSNAME: true
    },
    Settings: {
        WifiConfiguration: {
            MWC_NONE: false,
            MWC_SSID: true,
            MWC_ENCRYPTION_TYPE: true,
            MWC_PASSWORD: true,
            MWC_IDENTIFIER: false,
            MWC_OPEN: true,
            MWC_WEP: true,
            MWC_WPA_WPA2_PSK: true,
            MWC_GET_WIFI_CONFIGURATIONS: false,
            MWC_ADD_WIFI_CONFIGURATION: true,
            MWC_CHANGE_WIFI_CONFIGURATION: false,
            MWC_REMOVE_WIFI_CONFIGURATION: false
        },
        MailConfiguration: {
            MMC_ACCOUNT_TYPE: true,
            MMC_ADDRESS: true,
            MMC_ACCOUNT_NAME: true,
            MMC_IN_AUTH: true,
            MMC_IN_HOSTNAME: true,
            MMC_IN_USERNAME: true,
            MMC_IN_USERPW: true,
            MMC_IN_PORT: true,
            MMC_IN_USESSL: true,
            MMC_OUT_AUTH: true,
            MMC_OUT_HOSTNAME: true,
            MMC_OUT_USERNAME: true,
            MMC_OUT_USERPW: true,
            MMC_OUT_PORT: true,
            MMC_OUT_USESSL: true,
            MMC_EMAILAUTH_NONE: true,
            MMC_EMAILAUTH_PASSWORD: true,
            MMC_EMAILAUTH_CRAMMD5: true,
            MMC_EMAILAUTH_NTLM: true,
            MMC_EMAILAUTH_HTTPMD5: true,
            MMC_POP: true,
            MMC_IMAP: true,
            MMC_GET_MAIL_CONFIGURATIONS: false,
            MMC_ADD_MAIL_CONFIGURATION: true,
            MMC_CHANGE_MAIL_CONFIGURATION: false,
            MMC_REMOVE_MAIL_CONFIGURATION: false
        },
        ExchangeConfiguration: {
            MEC_EMAILADDRESS: true,
            MEC_HOSTADDRESS: true,
            MEC_USERNAME: true,
            MEC_USERPW: true,
            MEC_USESSL: true,
            MEC_DOMAIN: true,
            MEC_GET_EXCHANGE_CONFIGURATIONS: false,
            MEC_ADD_EXCHANGE_CONFIGURATION: true,
            MEC_CHANGE_EXCHANGE_CONFIGURATION: false,
            MEC_REMOVE_EXCHANGE_CONFIGURATION: false
        },
        MobileConfiguration: true
    },
    Screenshot: true,
    RemoteControl: false,
    FileTransfer: true,
    Nudge: true,
    Clipboard: true,
    Chat: true,
    TeamViewerRunning: false,
    Debug: true
};
*/

// Example of a yet unknown mobile device (can get the Email- and Exchange-Configs)
/*
window.PF = {
    Monitoring: {
        MM_CPUUSAGE: true,
        MM_CPUFREQ: true,
        MM_BATTERYLOAD: true,
        MM_BATTERYSTATE: true,
        MM_BATTERYTEMPERATURE: false,
        MM_RAMUSAGE: true,
        MM_WLANENABLED: true,
        MM_WLANIP: true,
        MM_WLANSSID: true,
        MM_WLANMACADRESS: true,
        MM_INTERNALCAPACITYUSED: true,
        MM_SDCAPACITYUSED: false,
        MM_EXTERNALDISKMOUNTED: false,
        MM_BLUETOOTHSTATUS: false
    },
    Apps: false,
    Processes: {
        MP_PID: true,
        MP_NAME: true,
        MP_MEMORY_USED: false,
        MP_SERVICE_COUNT: false,
        MP_TYPE: true,
        MP_STARTTIME: true,
        MP_FUNC_GETICON: false,
        MP_FUNC_STOPPROCESSES: false
    },
    SystemLog: {
        MSL_LOGLEVEL: true,
        MSL_PID: true,
        MSL_MSG: true,
        MSL_TIMESTAMP: true,
        MSL_PROCESSNAME: true
    },
    Settings: {
        WifiConfiguration: {
            MWC_NONE: false,
            MWC_SSID: true,
            MWC_ENCRYPTION_TYPE: true,
            MWC_PASSWORD: true,
            MWC_IDENTIFIER: false,
            MWC_OPEN: true,
            MWC_WEP: true,
            MWC_WPA_WPA2_PSK: true,
            MWC_GET_WIFI_CONFIGURATIONS: false,
            MWC_ADD_WIFI_CONFIGURATION: true,
            MWC_CHANGE_WIFI_CONFIGURATION: false,
            MWC_REMOVE_WIFI_CONFIGURATION: false
        },
        MailConfiguration: {
            MMC_ACCOUNT_TYPE: true,
            MMC_ADDRESS: true,
            MMC_ACCOUNT_NAME: true,
            MMC_IN_AUTH: true,
            MMC_IN_HOSTNAME: true,
            MMC_IN_USERNAME: true,
            MMC_IN_USERPW: true,
            MMC_IN_PORT: true,
            MMC_IN_USESSL: true,
            MMC_OUT_AUTH: true,
            MMC_OUT_HOSTNAME: true,
            MMC_OUT_USERNAME: true,
            MMC_OUT_USERPW: true,
            MMC_OUT_PORT: true,
            MMC_OUT_USESSL: true,
            MMC_EMAILAUTH_NONE: true,
            MMC_EMAILAUTH_PASSWORD: true,
            MMC_EMAILAUTH_CRAMMD5: true,
            MMC_EMAILAUTH_NTLM: true,
            MMC_EMAILAUTH_HTTPMD5: true,
            MMC_POP: true,
            MMC_IMAP: true,
            MMC_GET_MAIL_CONFIGURATIONS: true,
            MMC_ADD_MAIL_CONFIGURATION: true,
            MMC_CHANGE_MAIL_CONFIGURATION: false,
            MMC_REMOVE_MAIL_CONFIGURATION: true
        },
        ExchangeConfiguration: {
            MEC_EMAILADDRESS: true,
            MEC_HOSTADDRESS: true,
            MEC_USERNAME: true,
            MEC_USERPW: true,
            MEC_USESSL: true,
            MEC_DOMAIN: true,
            MEC_GET_EXCHANGE_CONFIGURATIONS: true,
            MEC_ADD_EXCHANGE_CONFIGURATION: true,
            MEC_CHANGE_EXCHANGE_CONFIGURATION: false,
            MEC_REMOVE_EXCHANGE_CONFIGURATION: true
        },
        MobileConfiguration: true
    },
    Screenshot: true,
    RemoteControl: false,
    FileTransfer: true,
    Nudge: true,
    Clipboard: true,
    Chat: true,
    TeamViewerRunning: false,
    Debug: true
};
*/