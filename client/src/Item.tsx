import React from 'react';
import useWebSocket from 'react-use-websocket';
import styles from './index.module.css';
import type {ItemType} from './Model';

const Item: React.FC<{data: ItemType}> = ({data}) => {
  const [connected, setConnected] = React.useState<boolean>(false);
  const [value, setValue] = React.useState<string | null>(null);
  let throttlePause = React.useRef<boolean>(false);

  const {sendMessage, lastJsonMessage} = useWebSocket<ItemType | null>('ws://localhost:5001', {
    share: true,
    filter: (l) => {
      const jData = JSON.parse(l.data);
      return jData.id === data.id && !throttlePause.current
    }
  });

  const throttle = React.useCallback(() => {
    if (throttlePause.current) return;
    throttlePause.current = true;
    setTimeout(() => {
      throttlePause.current = false;
    }, 1000);
  }, [throttlePause]);


  React.useEffect(() => {
    throttle();
    if (lastJsonMessage?.value) {
      setValue(lastJsonMessage.value)
    }
  }, [lastJsonMessage?.value])

  React.useEffect(() => {
    if (lastJsonMessage) {
      setConnected(lastJsonMessage.connected)
    }

  }, [lastJsonMessage?.connected])

  const {unit, id, name} = data;
  const handleClick = React.useCallback(() => {
    sendMessage(JSON.stringify({command: connected ? "disconnect" : "connect", id}));
    throttlePause.current = false;
  }, [id, connected]);

  return (
    <div className={`${styles.item} ${connected && styles.connected}`}>
      <div className={styles.name}>{name}</div>
      <div className={styles.value}>{value || '0'} <span className={styles.unit}>{unit}</span></div>
      <div className={styles.btn} onClick={handleClick}>
        {connected ? "disconnect" : "connect"}
      </div>
    </div> 
  )
}

export default React.memo(Item);