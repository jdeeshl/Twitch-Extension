import React from 'react'
import Authentication from '../../util/Authentication/Authentication'
import pose from 'react-pose';

import './App.css'

const Box = pose.div({
    hidden: {
        opacity: 0,
        scale: 1
    }, 
    visible: {
        opacity: 1,
        scale: 10,
    }
});

export default class App extends React.Component{
    constructor(props){
        super(props)
        this.Authentication = new Authentication()
        this.handleButtonClick = this.handleButtonClick.bind(this);

        //if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null. 
        this.twitch = window.Twitch ? window.Twitch.ext : null
        this.state={
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

    handleButtonClick(e) {
        const {sku} = e.target.dataset;
        this.twitch.rig.log(sku);
        this.twitch.bits.useBits(sku);
        this.setState({
            showAnimation: true,
        }, () => {
            setTimeout(() => {
                this.setState({
                    showAnimation: false
                })
            }, 2000)
        })
    }
    
    render(){
        if(this.state.finishedLoading && this.state.isVisible){
            return (
                <div className="App">
                    {
                        this.state.products.map((product) => {
                            console.log(': ', product);
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
                        <Box className="box" pose={this.state.showAnimation ? "visible" : "hidden" }></Box>
                    </div>
                    <div className="btn-wrapper">
                        <button 
                            onClick={this.handleButtonClick} 
                            data-sku={'item'}
                            >
                            <span>{'Emoji'}</span>
                            <span>{'100'}</span>
                        </button>
                        <button onClick={this.handleButtonClick} name="button2">GG Bro 👊</button>
                        <button onClick={this.handleButtonClick} name="button3">WP 👏</button>
                        <button onClick={this.handleButtonClick} name="button4">NH 👌</button>
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