import React, { Component } from 'react';
import { Text, View, ScrollView, StyleSheet, Picker, Switch, Button, Modal, Alert } from 'react-native';
import { Card } from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import * as Animatable from 'react-native-animatable';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import * as Calendar from 'expo-calendar';




class Reservation extends Component {


  constructor(props){
    super(props);
    this.state = {
            guests: 1,
            smoking: false,
            date: '',
            showModal: false
        }
  }





  static navigationOptions = {
    title: 'Reserve Table'
  }

  toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }



    async addReservationToCalendar(date){
      await this.obtainCalendarPermission();
      var startDate = new Date(Date.parse(date));
      var endDate = new Date(Date.parse(date)+(2*60*60*1000));
      const defaultCalendarSource =
        Platform.OS === 'ios'
        ? await getDefaultCalendarSource()
        : { isLocalAccount: true, name: 'Expo Calendar' };
      const newCalendarID = await Calendar.createCalendarAsync({
        title: 'Claendar',
        color: 'blue',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource.id,
        source: defaultCalendarSource,
        name: 'internalCalendarName',
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });
      console.log(Calendar.DEFAULT)
      Calendar.createEventAsync(newCalendarID, {
        title:'Con Fusion Table Reservation',
        startDate: startDate,
        endDate: endDate,
        timeZone: 'Asia/Hong_Kong',
        location:'121, Clear Water Bay Road, Clear Water Bay, Kowloon, Hong Kong'
      });

    }

  async getDefaultCalendarSource() {
  const calendars = await Calendar.getCalendarsAsync();
  const defaultCalendars = calendars.filter(each => each.source.name === 'Default');
  return defaultCalendars[0].source;
}

    handleReservation() {
        console.log(JSON.stringify(this.state));
        this.addReservationToCalendar(this.state.date);
        this.toggleModal();
    }

    resetForm() {
        this.setState({
            guests: 1,
            smoking: false,
            date: '',
            showModal: false
        });
    }





    async obtainCalendarPermission() {
      let permission = await Calendar.getCalendarPermissionsAsync();
        if (permission.status !== 'granted') {
          permission = await Calendar.requestCalendarPermissionsAsync();
          if (permission.status !== 'granted') {
              Alert.alert('Permission not granted to get Calendar');
          }
        }
        return permission;
    }

    async obtainNotificationPermission() {
        let permission = await Permissions.getAsync(Permissions.USER_FACING_NOTIFICATIONS);
        if (permission.status !== 'granted') {
            permission = await Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS);
            if (permission.status !== 'granted') {
                Alert.alert('Permission not granted to show notifications');
            }
        }
        return permission;
    }

    async presentLocalNotification(date) {
        await this.obtainNotificationPermission();
        Notifications.presentLocalNotificationAsync({
            title: 'Your Reservation',
            body: 'Reservation for '+ date + ' requested',
            ios: {
                sound: true
            },
            android: {
                sound: true,
                vibrate: true,
                color: '#512DA8'
            }
        });
    }

  render(){

    const confirmationAlert = (guests, smoking, date) =>
    Alert.alert(
        "Your Reservation OK?",
        "Number of Guests: " + guests +"\n"+
        "Smoking? " + smoking + "\n"+
        "Date and Time: " + date
        ,
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "OK", onPress: () => {
            this.handleReservation();
            this.presentLocalNotification(this.state.date);
            this.resetForm();
          } }
        ],
        { cancelable: false }
      );

    return(
      <ScrollView>
      <Animatable.View animation='zoomInUp'>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>
            Number of Guests
          </Text>
          <Picker
          style={styles.formItem}
          selectedValue={this.state.guests}
          onValueChange={(itemValue, itemIndex) => this.setState({guests: itemValue})}
          >
            <Picker.Item label='1' value='1' />
            <Picker.Item label='2' value='2' />
            <Picker.Item label='3' value='3' />
            <Picker.Item label='4' value='4' />
            <Picker.Item label='5' value='5' />
            <Picker.Item label='6' value='6' />
          </Picker>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>
            Smoking/Non-Smoking?
          </Text>
          <Switch
          style={styles.formItem}
          value={this.state.smoking}
          onTintColor = '#512DA8'
          onValueChange = {(value) => this.setState({smoking:value})}
          >
          </Switch>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>
            Date and Time
          </Text>
          <DatePicker
          style={{flex:2, marginRight: 20}}
          date={this.state.date}
          format=''
          mode ='datetime'
          placeholder ='select date and time'
          minDate = '2020-06-28'
          confirmBtnText ='Confirm'
          cancelBtnText = 'Cancel'
          customSyles={{
            dateIcon:{
              position: 'absolute',
              left: 0,
              top: 4,
              marginLeft:0
            },
            dateInput:{
              marginLeft: 36,

            }
          }}
          onDateChange={(date) => {this.setState({date:date})}}
          />
        </View>
        <View style={styles.formRow}>
          <Button
            title='Reserve'
            color='#512DA8'
            onPress={()=>confirmationAlert(this.state.guests, this.state.smoking, this.state.date)}
            accessibilityLabel='Learn more about this purple button'
          />
        </View>
        </Animatable.View>
      </ScrollView>
    );
  }

}

const styles = StyleSheet.create({
  formRow:{
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    margin: 20
  },
  formLabel:{
    fontSize: 18,
    flex: 2
  },
  formItem:{
    flex:1
  },
  modal: {
       justifyContent: 'center',
       margin: 20
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#512DA8',
        textAlign: 'center',
        color: 'white',
        marginBottom: 20
    },
    modalText: {
        fontSize: 18,
        margin: 10
    }
})

export default Reservation;
