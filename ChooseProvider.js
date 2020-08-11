import {Image, SafeAreaView, ScrollView, StyleSheet, Text, View} from "react-native";
import React, {Component} from "react";
import {Button, Header, Input} from 'react-native-elements';
import {logoutFunc} from "../helpers/auth-helper";
import {connect} from "react-redux";
import INPUT_STYLES from "../styles/input-styles";
import BOTTOM_BUTTON_STYLES from "../styles/bottom-button-styles";
import HEADER_STYLES from "../styles/header-styles";
import PAGE_TITLE_STYLES from "../styles/page-title-styles";
import BODY_WRAPPER_STYLES from "../styles/body-wrapper-styles";
import {PARAGRAPH_SILVER, PRIMARY_BLUE, TEXT_BLUE} from "../constants/css-colors";
import Loading from "../parts/loading";
import PAGE_WRAPPER_STYLES from "../styles/page-wrapper-styles";
import SCROLL_STYLES from "../styles/scroll-styles";
import HeaderLogo from "../parts/header-logo";
import {ifValidPhoneNumber} from "../helpers/validators";
import NoInternetPart from "../parts/no-internet-part";
import PropTypes from "prop-types";
import {updateProvider} from '../actions/auth.action'
import SELECT_STYLES, {SELECT_WIDTH} from "../styles/select-styles";
import {providersListFunc} from "../helpers/recharge-helper";
import {getProviderInfo} from "../helpers/device-info-helper";
import ModalDropdown from 'react-native-modal-dropdown';
import {getImageSize} from "../helpers/image-helper";
import {setCurrentScreen} from "../helpers/analytics-helper";

const MAX_HEIGHT = 25;
const MAX_WIDTH = 80;

class ChooseProvider extends Component {
    state = {
        pageTitle: 'Recharge',
        console: '',
        loading: true,
        providers: [],
        providerPlaceholder: {
            image: require('../assets/images/prov_loader.png'),
            width: 42,
            height: 25
        }
    };


    componentDidMount() {
        setCurrentScreen(this.props.navigation.state.routeName);
        this.getProvidersList();
    }

    componentDidUpdate(props, state) {
        if(this.state.providers.length !== state.providers.length) {
            this.setPlansLogoSizes();
        }
    }

    async setPlansLogoSizes() {
        const providers = this.state.providers;
        for (const provider of providers) {
            const sizes = await getImageSize(provider.value.logo, MAX_HEIGHT, MAX_WIDTH)
            provider.value.width = sizes.width;
            provider.value.height = sizes.height;
        }
        this.setState({
            providers
        })
    }

    async getProvidersList() {
        const providerInfo = await getProviderInfo();
        const res = await providersListFunc(this.props.user);
        if(res.success) {
            const providers = res.providers || [];
            if(providerInfo) {
                const selectedProvider = providers.find(item => item.label.toLowerCase() === providerInfo.toLowerCase());
                if(selectedProvider) {
                    this.props.updateProvider(selectedProvider.value);
                }
            }
            this.setState({
                providers: providers,
                loading: false,
            })
        } else {
            this.setState({
                console: res.errorMessage,
                loading: false,
            })
        }
    }

    chooseProvider(index, provider) {
       if(provider && provider.value) {
          this.props.updateProvider(provider.value);
       }
    }

    goToRechargePage() {
        this.props.navigation.navigate('Recharge')
    }

    async logout() {
        await logoutFunc();
        this.props.navigation.navigate('LoginOrRegister')
    }

    render() {
        return (
            <View style={styles.container}>
                <NoInternetPart/>
                <Header
                    leftComponent={{ icon: 'arrow-back',type: 'material', color: PRIMARY_BLUE,size: 20, onPress: () => this.props.navigation.navigate('Home') }}
                    rightComponent={{ icon: 'input', color: PRIMARY_BLUE,size: 20, onPress: () => this.logout() }}
                    containerStyle={HEADER_STYLES}
                    centerComponent={<HeaderLogo/>}
                />
                <SafeAreaView style={SCROLL_STYLES}>
                    <ScrollView>
                        <Text style={PAGE_TITLE_STYLES}>{this.state.pageTitle}</Text>
                        <View style={{...styles.formWrapper}}>
                            <View style={{maxWidth: SELECT_WIDTH}}>
                                <Input
                                    inputContainerStyle={{...styles.inputContainerStyle,width: SELECT_WIDTH}}
                                    style={styles.input}
                                    placeholder='Mobile Number'
                                    leftIcon={{ type: 'font-awesome', name: 'mobile',color: PRIMARY_BLUE }}
                                    inputStyle={styles.input}
                                    labelStyle={styles.label}
                                    keyboardType="phone-pad"
                                    label={'Mobile Number'}
                                    disabled={true}
                                    value={this.props.user.mobileNumber}
                                />
                                <Text style={styles.selectLabel}>Provider</Text>
                               <ModalDropdown
                                    options={this.state.providers}
                                    style={styles.selectWrapper}
                                    textStyle={styles.selectPlaceholder}
                                    defaultValue={((this.props.provider)?this.props.provider.name:'Select your provider')}
                                    renderButtonText = {(option) => (
                                        <Text style={styles.optionTextStyles}>{option.label}</Text>
                                    )}
                                    onSelect={(index,option) => this.chooseProvider(index,option)}
                                    dropdownStyle={styles.selectDropDownStyles}
                                    renderRow={
                                        (option,index,isSelected) =>  (
                                            <View style={styles.optionStyles}>
                                                <Image
                                                    style={{
                                                        width:  option.value.width || this.state.providerPlaceholder.width,
                                                        height: option.value.height || this.state.providerPlaceholder.height
                                                    }}
                                                    source={(option.value.logo && option.value.width)?{uri: option.value.logo}:this.state.providerPlaceholder.image}
                                                    resizeMethod={'scale'}
                                                />
                                                <Text style={styles.optionTextStyles}>{option.label}</Text>
                                            </View>
                                        )
                                    }
                                />
                            </View>
                             {/*<Text>{JSON.stringify(this.props.provider)}</Text>*/}
                             <Loading loading={this.state.loading} errorMessage={this.state.console}/>
                            <View style={{...styles.bottomWrapper}}>
                                <Button
                                    onPress={() => this.goToRechargePage()}
                                    title="Continue"
                                    buttonStyle={styles.button}
                                    disabled={this.state.loading || !ifValidPhoneNumber(this.props.user.mobileNumber) || !this.props.provider}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </View>
        );
    }
}


ChooseProvider.propTypes = {
    updateProvider: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        provider: state.provider,
        user: state.user,
    };
};

const mapDispatchToProps = {
    updateProvider
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseProvider);

const styles = StyleSheet.create({
    text: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20
    },
    selectLabel: {
        marginTop: 8,
        marginLeft: 10,
        marginRight: 10,
        color: TEXT_BLUE,
        fontWeight: 'bold',
        fontSize: 16
    },
    ...INPUT_STYLES,
    ...BOTTOM_BUTTON_STYLES,
    ...BODY_WRAPPER_STYLES,
    ...PAGE_WRAPPER_STYLES,
     ...SELECT_STYLES
});
