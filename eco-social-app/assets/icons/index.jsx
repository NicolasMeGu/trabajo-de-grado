import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Home from './Home'
import {theme} from '../../constants/theme'
import Mail from './Mail'
import Lock from './Lock'
import User from './User'
import Heart from './Heart'
import Plus from './Plus'
import Search from './Search'
import Location from './Location'
import Call from './Call'
import Camera from './Camera'
import Edit from './Edit'
import ArrowLeft from './ArrowLeft'
import Comment from './Comment'
import Share from './Share'
import Send from './Send'
import Delete from './Delete'
import Logout from './Logout'
import Image from './Image'
import Video from './Video'
import DotsHorizontal from './DotsHorizontal'
import Maps from './Maps'
import Chat from './Chat'
import Right from './Right'


const icons = {
  maps:Maps,
  chat:Chat,
    home:Home,
    right:Right,
    dots:DotsHorizontal,
    mail:Mail,
    lock:Lock,
    user:User,
    heart:Heart,
    plus:Plus,
    search:Search,
    location:Location,
    call:Call,
    camera: Camera,
    edit: Edit,
    arrowLeft:ArrowLeft,
    comment:Comment,
    share:Share,
    send:Send,
    delete:Delete,
    logout:Logout,
    image:Image,
    video:Video,

    
}

const Icon = ({name, ...props}) => {
    const IconComponent = icons[name];

  return (
    <IconComponent 
    height={props.size || 24 }
    width={props.size || 24 }
    strokeWidth={props.strokeWidth || 1.9}
    color={theme.colors.textLight}
    {...props}

    />
  )
}

export default Icon
