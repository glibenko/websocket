import React from 'react';
import useWebSocket from 'react-use-websocket';
import Item from './Item';
import styles from './index.module.css';
import type {ItemType, ListType} from './Model';

const App = () => {
  const [list, setList] = React.useState<ListType>({});
  const {lastJsonMessage, readyState} = useWebSocket<ItemType | null>('ws://localhost:5001', {
    share: true,
    filter: (l) => {
      const data: ItemType = JSON.parse(l.data);
      return !list[data.id]
    }
  });

  React.useEffect(() => {
    if (lastJsonMessage?.id && readyState) {
      setList(prev => ({...prev, [String(lastJsonMessage.id)]: lastJsonMessage}))
    }
  }, [lastJsonMessage, readyState]);
 
  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {Object.keys(list).map(key => <Item key={key} data={list[key]} />)}
      </div>
    </div>
  )
}

export default App;