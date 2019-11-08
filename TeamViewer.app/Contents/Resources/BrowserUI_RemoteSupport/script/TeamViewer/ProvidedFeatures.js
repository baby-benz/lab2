var ProvidedFeatures =
{
	// Module Monitoring
	// Cpu
	MM_CPUUSAGE							: 1001,	// [float[]:0-1]	[P:AND;IOS]	// in % per core
	MM_CPUFREQ							: 1002,	// [int[]:]			[P:AND;IOS]	// in MHZ
	// Battery
	MM_BATTERYLOAD						: 2001,	// [float:0-1]		[P:AND;IOS]	// in %
	MM_BATTERYSTATE						: 2002,	// [boolean]		[P:AND;IOS]
	MM_BATTERYTEMPERATURE				: 2003,	// [float]			[P:AND]		// in °C
	// Ram
	MM_RAMUSAGE							: 3001,	// [long[2]]		[P:AND;IOS]	// in kB. [0] = total, [1] = available
	// WIFI
	MM_WLANENABLED						: 4001,	// [boolean]		[P:AND;IOS]
	MM_WLANIP							: 4002,	// [String]			[P:AND;IOS]
	MM_WLANSSID							: 4003,	// [String]			[P:AND;IOS]
	MM_WLANMACADRESS					: 4004,	// [String]			[P:AND;IOS]
	// Disk Usage
	MM_INTERNALCAPACITYUSED				: 5001,	// [long[2]]		[P:AND;IOS]	// in kB. [0] = total, [1] = available
	MM_SDCAPACITYUSED					: 5002,	// [long[2]]		[P:AND;IOS]	// in kB. [0] = total, [1] = available
	MM_EXTERNALDISKMOUNTED				: 5003,	// [boolean]		[P:AND]
	// Bluetooth
	MM_BLUETOOTHSTATUS					: 6001,	// [boolean]		[P:AND]
	
	// Module Apps
	MA_NAME								: 1,	// (string)	Fuer den Benutzer verstaendlicher Name der App
	MA_INSTALL_DATE						: 2,	// (long)	Installationsdatum (milliseconds since January 1, 1970 00:00:00 UTC)
	MA_UPDATE_DATE						: 3,	// (long)	Datum des letzten App Updates (milliseconds since January 1, 1970 00:00:00 UTC)
	MA_VERSION_CODE						: 4,	// (int)	Versions Code der App (streng monoton steigend mit den App Updates)
	MA_VERSION_NAME						: 5,	// (string)	Fuer den Benutzer verstaendlicher Versions String
	MA_SIZE								: 6,	// (long)	Gesamtgroesse der App
	MA_CODE_SIZE						: 7,	// (long)	Codegroesse der App
	MA_DATA_SIZE						: 8,	// (long)	Datengroesse der App
	MA_CACHE_SIZE						: 9,	// (long)	Cachegroesse der App

	// Module Processes
	MP_PID 								: 1,	// (int)	PID des Prozesses (unter Android: PID : Key)
	MP_NAME								: 2,	// (string)	Für den Benutzer verstaendlicher Name des Prozesses
	MP_MEMORY_USED						: 3,	// (int)	aktueller benoetigter Speicher des Prozesses
	MP_SERVICE_COUNT					: 4,	// (int)	Anzahl der laufenden Services fuer diesen Prozess
	MP_UPDATE_TIMESTAMP 				: 5,	// (long)	Zeitstempel des letzten Updates
	MP_TYPE 							: 6,	// (int)	ID des Prozesstyps (siehe enum ProcessType)
	MP_STARTTIME 						: 7,	// (long)	Startzeit des Prozesses (milliseconds since January 1, 1970 00:00:00 UTC)
	
	// Module SystemLog
	MSL_LOGLEVEL						: 1,	// (int)	see SystemLogModuleDefinitions.h#LogLevel
	MSL_PID								: 2,	// (int)	id of the process
	MSL_MSG								: 3,	// (string)	log message
	MSL_TIMESTAMP						: 4,	// (long)	milliseconds since 1.1.1970 0:00 UTC
	MSL_PROCESSNAME						: 5,	// (string)	name of the process
	
	// Module WifiConfiguration
	// keys for value
	MWC_NONE							: 0,
	MWC_SSID							: 1,	// (string)	ssid of the wifi network
	MWC_ENCRYPTION_TYPE					: 2,	// (int)	EncryptionType (example: MWC_OPEN or MWC_WEP)
	MWC_PASSWORD						: 3,	// (string)	the password
	MWC_IDENTIFIER						: 4,	// (string)	unique identifier of the configuration
	// values for encryptions
	MWC_ANY								: 20,
	MWC_OPEN							: 21,
	MWC_WEP								: 22,
	MWC_WPA_WPA2_PSK					: 23,
	// functions
	MWC_GET_WIFI_CONFIGURATIONS			: 101,
	MWC_ADD_WIFI_CONFIGURATION			: 102,
	MWC_CHANGE_WIFI_CONFIGURATION		: 103,
	MWC_REMOVE_WIFI_CONFIGURATION		: 104,
	
	// Module MailConfiguration
	MMC_NONE							: 0,
	MMC_ACCOUNT_TYPE					: 1,	// (int)	EmailAccountType(MMC_POP,MMC_IMAP)
	MMC_ADDRESS							: 2,	// (string)	full email adress of the account
	MMC_ACCOUNT_NAME					: 3,	// (string)	full user name of the account (used for semt message, etc.)
	
	MMC_IN_AUTH							: 4,	// (int)	EmailAuthenticationType (MMC_EMAILAUTH_NONE, MMC_EMAILAUTH_PASSWORD, ...)
	MMC_IN_HOSTNAME						: 5,	// (string)	Hostname of the incoming mailserver
	MMC_IN_USERNAME						: 6,	// (string)	Username for the incoming mailserver
	MMC_IN_USERPW						: 7,	// (string)	password of the user
	MMC_IN_PORT							: 8,	// (int)	port for the host
	MMC_IN_USESSL						: 9,	// (bool)	use ssl

	MMC_OUT_AUTH						: 10,	// (int)	EmailAuthenticationType (MMC_EMAILAUTH_NONE, MMC_EMAILAUTH_PASSWORD, ...)
	MMC_OUT_HOSTNAME					: 11,	// (string)	Hostname of the outgoing mailserver
	MMC_OUT_USERNAME					: 12,	// (string)	Username for the outgoing mailserver
	MMC_OUT_USERPW						: 13,	// (string)	password of the user
	MMC_OUT_PORT						: 14,	// (int)	port for the host
	MMC_OUT_USESSL						: 15,	// (bool)	use ssl
	
	MMC_EMAILAUTH_NONE					: 30,
	MMC_EMAILAUTH_PASSWORD				: 31,
	MMC_EMAILAUTH_CRAMMD5				: 32,
	MMC_EMAILAUTH_NTLM					: 33,
	MMC_EMAILAUTH_HTTPMD5				: 34,
	
	MMC_POP								: 50,
	MMC_IMAP							: 51,
	
	MMC_GET_MAIL_CONFIGURATIONS			: 101,
	MMC_ADD_MAIL_CONFIGURATION			: 102,
	MMC_CHANGE_MAIL_CONFIGURATION		: 103,
	MMC_REMOVE_MAIL_CONFIGURATION		: 104,
	
	// Module ExchangeConfiguration
	MEC_NONE							: 0,
	MEC_EMAILADDRESS					: 1,	// (string)	full email adress of the account
	MEC_HOSTADDRESS						: 2,	// (string)	ExchangeServer adress
	MEC_USERNAME						: 3,	// (string)	username of the exchange account
	MEC_USERPW							: 4,	// (string)	password for the user
	MEC_USESSL							: 5,	// (bool)	use ssl
	MEC_DOMAIN							: 6,	// (string)	Domainname
	MEC_GET_EXCHANGE_CONFIGURATIONS		: 101,
	MEC_ADD_EXCHANGE_CONFIGURATION		: 102,
	MEC_CHANGE_EXCHANGE_CONFIGURATION	: 103,
	MEC_REMOVE_EXCHANGE_CONFIGURATION	: 104
};