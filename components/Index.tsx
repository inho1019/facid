import { useEffect, useState } from "react";
import Main from "./Main";
import { Keyboard, PermissionsAndroid, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import Attain from "./Attain";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PushNotification from "react-native-push-notification";

export type TodoDTO = {
    id : number,
    content : string,
    success : boolean,
    alarm : boolean,
    alarmDate : Date,
    time : any,
    date : Date
}

export type RoutineDTO = {
    id : number,
    content : string,
    term : boolean[]
    startDate : Date,
    end : boolean,
    endDate : Date,
    success : Date[],
    alarm : boolean,
    alarmDate : Date,
    time : any,
}

const Index: React.FC = () => {

    const [key,setKey] = useState(false)
    const [todoList,setTodoList] = useState<TodoDTO[]>([])
    const [routineList,setRoutineList] = useState<RoutineDTO[]>([])
    const [todoId,setTodoId] = useState<number>(0)
    const [routineId,setRoutineId] = useState<number>(0)

    useEffect(() => {
        if (Platform.OS === 'android') {
            const requestAlarmPermission = async () => {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                        {
                            title: 'Alarm Permission',
                            message: 'App needs permission for alarm access',
                buttonPositive: 'OK',
                },
            )
            if(granted === PermissionsAndroid.RESULTS.GRANTED){
                console.log('success');
            }else {
                console.log('Please alarm permission');
            }
        } catch (err) {
            console.log('Alarm permission err');
            console.warn(err);
        }
        };
            requestAlarmPermission();
        }

        PushNotification.createChannel(
            {
                channelId: "todo", 
                channelName: "계획 알람",
                importance: 4, 
                vibrate: true, 
            },
            (created: boolean) => console.log(`createChannel riders returned '${created}'`) 
        );


        const keyShow = () => {
            setKey(true)
        };
        
        const keyHide = () => {
            setKey(false)
        };
        
        const keyShowListner = Keyboard.addListener('keyboardDidShow', keyShow);
        const keyHideListner = Keyboard.addListener('keyboardDidHide', keyHide);

        return () => {
            keyShowListner.remove();
            keyHideListner.remove();
        };
    },[])
    ////////데이터 저장 및 불러오기////////
    useEffect(() => {
        const setData = async () => {
            try {
                AsyncStorage.setItem("todoId",todoId.toString())
            } catch (error) {
                console.error('저장 중 오류 발생', error);
            }
        }
        if(todoId !== 0) {
            setData();
        }
    },[todoId])

    useEffect(() => {
        const setData = async () => {
            try {
                AsyncStorage.setItem("routineId",routineId.toString())
            } catch (error) {
                console.error('저장 중 오류 발생', error);
            }
        }
        if(routineId !== 0) {
            setData();
        }
    },[routineId])

    useEffect(() => {
        const setData = async () => {
            try {
                AsyncStorage.setItem("todoList", JSON.stringify(todoList))
            } catch (error) {
                console.error('저장 중 오류 발생', error);
            }
        }
        if(todoId !== 0) {
            setData();
        }
    },[todoList])

    useEffect(() => {
        const setData = async () => {
            try {
                AsyncStorage.setItem("routineList", JSON.stringify(routineList))
            } catch (error) {
                console.error('저장 중 오류 발생', error);
            }
        }
        if(routineId !== 0) {
            setData();
        }
    },[routineList])
    
    useEffect(() => {
        const getData = async () => {
            try {
                const toId = await AsyncStorage.getItem("todoId");
                const toList = await AsyncStorage.getItem("todoList");
                const rouId = await AsyncStorage.getItem("routineId");
                const rouList = await AsyncStorage.getItem("routineList");
                
                if (toId !== null) {
                    setTodoId(parseInt(toId))
                }
                if (toList !== null) {
                    const typeList : TodoDTO[] = JSON.parse(toList, (key, value) => {
                        if (key === 'date' || key === 'alarmDate') {
                            return new Date(value);
                        }
                        return value;
                    })
                    setTodoList(typeList);
                }
                if (rouId !== null) {
                    setRoutineId(parseInt(rouId))
                }
                if (rouList !== null) {
                    const typeList : RoutineDTO[] = JSON.parse(rouList, (key, value) => {
                        if (key === 'date' || key === 'alarmDate') {
                            return new Date(value);
                        }
                        return value;
                    })
                    setRoutineList(typeList);
                }
            } catch (error) {
                console.error('불러오기 중 오류 발생', error);
            }
        }
        getData();
    },[])
    
    //////////////////////////////////////////////////

    const onTodoAlarm = (alarmId : number,newDate : Date) => {
        const alarmTodo = todoList.find(fd => fd.id === alarmId);
        const message = alarmTodo ? alarmTodo.content : "스케줄";

        PushNotification.localNotificationSchedule({
            channelId: "todo",
            tag: "todo",
            title: "스케줄",
            message: message,
            date: newDate,
            vibration: 3000,
            id: alarmId
        });

        setTodoList(list => list.map(item => {
            if(item.id === alarmId) {
                return {...item, alarm : true, alarmDate : newDate}
            } else {
                return item
            }
        }))
    } 

    const onCancelAlarm = (id : number) => {

        PushNotification.clearLocalNotification("todo", id);

        setTodoList(list => list.map(item => {
            if(item.id === id) {
                return {...item, alarm : false, alarmDate : new Date()}
            } else {
                return item
            }
        }))
    }

    const onTodoDTO = (todoDTO : TodoDTO) => {
        setTodoList(item => {
            return [...item,{...todoDTO, id : todoId}]
        })
        setTodoId(item => item + 1)
    }

    const onTodoCheck = (id : number) => {
        setTodoList(list => list.map(item => {
            if(item.id === id) {
                return {...item, success: !item.success}
            } else {
                return item
            }
        }))
    }

    const onTodoDelete = (id : number) => {
        setTodoList(list => {
            return [...list.filter( filt => filt.id !== id )]
        })
    }

    const onRoutineCheck = (id : number,date : Date) => {
        setRoutineList(list => list.map(item => {
            if(item.id === id) {
                if(item.success.findIndex(fd => fd.toLocaleDateString() === date.toLocaleDateString()) === -1) {
                    return {...item,success : [...item.success, date]};
                } else {
                    return {...item,success : item.success.filter(filt => filt.toLocaleDateString() !== date.toLocaleDateString())};
                }
            } else {
                return item
            } 
        }))
    }

    const onRoutineDTO = (routineDTO : RoutineDTO) => {
        setRoutineList(item => [...item,routineDTO])
        setRoutineId(item => item + 1)
    }

    const onMove = (dt : Date , latId : number) => {
        setTodoList(list => {
            const newItem: TodoDTO | undefined = list.find(fd => fd.id === latId);

            if (newItem) {
                return [ {...newItem,date : dt},...list.filter( filt => filt.id !== latId ) ]
            } else {
                return list
            }
        })
    }

    const globalFont =  'black'

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} disabled={!key}>
            <View style={{flex:1}}>
                <ScrollView
                    pagingEnabled
                    horizontal
                    keyboardShouldPersistTaps='handled'
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{width: `200%`}}
                    scrollEventThrottle={50}
                    decelerationRate="fast"
                >
                    <Main globalFont={globalFont} keys={key} routineId={routineId}
                        onTodoAlarm={onTodoAlarm} onCancelAlarm={onCancelAlarm} onTodoDTO={onTodoDTO} onTodoCheck={onTodoCheck}
                        onRoutineCheck={onRoutineCheck} onMove={onMove} onTodoDelete={onTodoDelete} onRoutineDTO={onRoutineDTO}
                        todoList={todoList} routineList={routineList}/>
                    <Attain/>
                </ScrollView>
            </View>
        </TouchableWithoutFeedback>
    )
}

export default Index;