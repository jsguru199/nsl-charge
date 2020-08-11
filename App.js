import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import  {Provider} from 'react-redux'
import AppContainer from  './src/routes/auth.stack'
import store from "./src/store/store";
import { StatusBar } from 'react-native';
import {ifMinApiLevel} from "./src/helpers/device-info-helper";



export default class App extends Component {

  async checkApiLevel() {
      const condition = await ifMinApiLevel();
      if(condition){
          StatusBar.setBackgroundColor('#000000', true);
      } else {
          StatusBar.setBarStyle('dark-content', true);
          StatusBar.setBackgroundColor('white', true);
      }
  }

  render() {
      this.checkApiLevel();

        return (
            <Provider store={store}>
              <AppContainer />
            </Provider>
        );
  }
}

const styles = StyleSheet.create({
  container: {

  },
});
