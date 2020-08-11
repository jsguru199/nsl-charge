import {StyleSheet, Text, View} from "react-native";
import React, {Component} from "react";
import {Header} from 'react-native-elements';
import {connect} from "react-redux";
import HEADER_STYLES from "../styles/header-styles";
import {getDeviceFullInfo} from "../helpers/device-info-helper";

class Test extends Component {

    state = {
        pageTitle: 'Test',
        firstView: true,
        console: ''
    };

     componentDidMount() {
        // this.getDeviceFullInfo();
    }

    async getDeviceFullInfo() {
        const info = await getDeviceFullInfo();
        this.setState({
            console: JSON.stringify(info)
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <Header
                    leftComponent={{ icon: 'chevron-left', color: '#fff',size: 25, onPress: () => this.props.navigation.navigate('Home') }}
                    centerComponent={{ text: this.state.pageTitle.toUpperCase(), style: { color: '#fff' } }}
                    containerStyle={HEADER_STYLES}
                />
                <View style={styles.contentWrapper}>
                    <Text>{this.state.console}</Text>
                </View>
            </View>
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
    };
};

export default connect(mapStateToProps)(Test);

const styles = StyleSheet.create({
    container: {

    }
});
