import React from 'react'
import Authentication from '../../util/Authentication/Authentication'
import pose from 'react-pose';
import Sound from 'react-sound';

import './App.css'

const skuToSound = {
    "000":"Catapult-SoundBible.com-829548288.mp3",
    "001":"Throw_Knife-Anonymous-1894795848.mp3",
    "002":"Snow Ball Throw And Splat-SoundBible.com-992042947.mp3",
    "003":"Puking_Or_Fighting-Puke_Man-1368560516.mp3"
}

const ButtonWrapper = pose.div({
    hidden: {
        opacity: 0
    },
    visible: {
        opacity: 1
    }
})

const Box = pose.div({

    hidden: {
        opacity: 0,
        scale: 1
    }, 
    visible: {
        opacity: 1,
        scale: 5,
        transition: {
            type: 'spring',
            stiffness: 120,
            damping: 2
          }
    }
});

export default class App extends React.Component{
    constructor(props){
        super(props)
        this.Authentication = new Authentication()
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.toggleBtnWrapper = this.toggleBtnWrapper.bind(this);
        this.products = {
            "000": "GG bro 👊" ,
            "001": "NH sir 🧐",
            "002": "WP buddy 🐳",
            "003": "💩" 
        }
        //if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null. 
        this.twitch = window.Twitch ? window.Twitch.ext : null
        this.state={
            shouldPlaySound: false,
            soundFileName: "",
            selectedSKU: "",
            showBtnWrapper: false,
            showAnimation: false,
            products: [],
            finishedLoading:false,
            theme:'light',
            isVisible:true
        }
    }

    contextUpdate(context, delta){
        if(delta.includes('theme')){
            this.setState(()=>{
                return {theme:context.theme}
            })
        }
    }

    visibilityChanged(isVisible){
        this.setState(()=>{
            return {
                isVisible
            }
        })
    }

    componentDidMount(){
        if(this.twitch){
            this.twitch.onAuthorized((auth)=>{
                this.Authentication.setToken(auth.token, auth.userId)
                this.twitch.bits.getProducts().then((products) => {
                    // this.twitch.rig.log(products);
                    if(!this.state.finishedLoading){
                        // if the component hasn't finished loading (as in we've not set up after getting a token), let's set it up now.
    
                        // now we've done the setup for the component, let's set the state to true to force a rerender with the correct data.
                        this.setState(()=>{
                            return {
                                products,
                                finishedLoading:true
                            }
                        })
                    }
                }).catch((error) => {
                    console.log('error: ', error);
                })
                // if(!this.state.finishedLoading){
                //     // if the component hasn't finished loading (as in we've not set up after getting a token), let's set it up now.

                //     // now we've done the setup for the component, let's set the state to true to force a rerender with the correct data.
                //     this.setState(()=>{
                //         return {finishedLoading:true}
                //     })
                // }
            })

            this.twitch.listen('broadcast',(target,contentType,body)=>{
                this.twitch.rig.log(`New PubSub message!\n${target}\n${contentType}\n${body}`)
                // now that you've got a listener, do something with the result... 

                // do something...

            })

            this.twitch.onVisibilityChanged((isVisible,_c)=>{
                this.visibilityChanged(isVisible)
            })

            this.twitch.bits.onTransactionComplete((transaction)=>{
                console.log(transaction);
            }) 

            this.twitch.onContext((context,delta)=>{
                this.contextUpdate(context,delta)
            })
        }
    }

    componentWillUnmount(){
        if(this.twitch){
            this.twitch.unlisten('broadcast', ()=>console.log('successfully unlistened'))
        }
    }

    handleButtonClick(sku) {
        // const {sku} = e.target.dataset;
        this.twitch.rig.log(sku);
        this.twitch.bits.useBits(sku);
        this.setState({
            showAnimation: true,
            selectedSKU: sku,
            shouldPlaySound: true,
            soundFileName: skuToSound[sku]
        }, () => {
            setTimeout(() => {
                this.setState({
                    showAnimation: false
                })
            }, 2500)
        })
    }

    toggleBtnWrapper() {
        this.twitch.rig.log('working');
        this.setState((prevState) => {
            return {
                showBtnWrapper: !prevState.showBtnWrapper
            }
        })
    }

    
    render(){
        if(this.state.finishedLoading && this.state.isVisible){
            this.twitch.rig.log("selectedSKU", this.state.selectedSKU)

            return (
                
                <div className="App">
                    {this.state.shouldPlaySound && <Sound url={
                        `../../assets/${this.state.soundFileName}`} 
                    playStatus={Sound.status.PLAYING} 
                    onFinishedPlaying={
                        ()=>this.setState({
                            shouldPlaySound:false
                        })}
                    />}
                    {
                        this.state.products.map((product) => {
                            // console.log(': ', product);
                            return (
                                <button 
                                    onClick={this.handleButtonClick} 
                                    data-sku={products.sku}
                                    >
                                    <span>{product.displayName}</span>
                                    <span>{product.cost.amount}</span>
                                </button>
                            )
                        })
                    }
                    <div className="playground">
                        <Box className="box" pose={this.state.showAnimation ? "visible" : "hidden" }>
                            <span>{this.products[this.state.selectedSKU]}</span>
                        </Box>
                    </div>
                    <div className="money-btn-wrapper">
                        <ButtonWrapper className="btn-wrapper" pose={this.state.showBtnWrapper ? "visible" : "hidden" }>
                            <button 
                                onClick={() => {
                                    this.handleButtonClick("000")
                                }} 
                                >
                                <span>{'10 bits: '}</span>
                                <span>{'GG 👊'}</span>
                            </button>
                            <button 
                                onClick={() => {
                                    this.handleButtonClick("001")
                                }}   
                                >
                                <span>{'25 bits: '}</span>
                                <span>{'NH 🧐'}</span>
                            </button>
                            <button 
                                onClick={() => {
                                    this.handleButtonClick("002")
                                }} 
                                >
                                <span>{'50 bits: '}</span>
                                <span>{'WP 🐳'}</span>
                                
                            </button>
                            <button 
                                onClick={() => {
                                    this.handleButtonClick("003")
                                }} 
                                >
                                <span>{'100 bits: '}</span>
                                <span>{'💩'}</span>
                            </button>
                        </ButtonWrapper>
                        <button className="rain-btn" onClick={this.toggleBtnWrapper}>Make it rain 💸</button>
                    </div>

                    {/* <div className={this.state.theme === 'light' ? 'App-light' : 'App-dark'} >
                        <p>Hello world!</p>
                        <p>My token is: {this.Authentication.state.token}</p>
                        <p>My opaque ID is {this.Authentication.getOpaqueId()}.</p>
                        <div>{this.Authentication.isModerator() ? <p>I am currently a mod, and here's a special mod button <input value='mod button' type='button'/></p>  : 'I am currently not a mod.'}</div>
                        <p>I have {this.Authentication.hasSharedId() ? `shared my ID, and my user_id is ${this.Authentication.getUserId()}` : 'not shared my ID'}.</p>
                    </div> */}
                </div>
            )
        } else {
            return (
                <div className="App">
                </div>
            )
        }

    }
}