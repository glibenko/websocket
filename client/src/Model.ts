export interface Dictionary {
  [key: string]: string | boolean
}

export interface ItemType extends Dictionary { 
  id: string;
  name: string;
  connected: boolean;
  unit: string;
  value: string;
}

export interface ListType {
  [key: string]: ItemType
}

// export type Json = {"id":"2","name":"Humidity","connected":true,"unit":"%","value":"45.952"}

export interface SendMessageType { 
  command: 'connect' | 'disconnect';
  id: string;
} 