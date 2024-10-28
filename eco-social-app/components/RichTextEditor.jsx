import { StyleSheet, Text, View } from 'react-native';
import React, { useRef } from 'react';
import { RichEditor, actions, RichToolbar } from 'react-native-pell-rich-editor';
import { theme } from '../constants/theme';

const RichTextEditor = ({ onChange }) => {
  // Crear una referencia para el RichEditor
  const editorRef = useRef(null);

  return (
    <View style={{ minHeight: 10 }}>
      {/* Editor de texto enriquecido */}
      <RichEditor
        ref={editorRef} // Asignar la referencia al editor
        onChange={onChange} // Pasar la función onChange
        
      />

      {/* Barra de herramientas del editor */}
      <RichToolbar
        actions={[
          actions.setStrikethrough,
          actions.removeFormat,
          actions.setBold,
          actions.setItalic,
          actions.insertOrderedList,
          actions.blockquote,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.code,
          actions.line,
          actions.heading1,
          actions.heading4
        ]}
        iconMap={{
          [actions.heading1]: ({ tintColor }) => (
            <Text style={{ color: tintColor }}>h1</Text>
          ),
          [actions.heading4]: ({ tintColor }) => (
            <Text style={{ color: tintColor }}>h4</Text>
          )
        }}
        style={styles.richBar}
        flatContainerStyle={styles.flatStyle}
        selectedIcomTint={theme.colors.primaryDark}
        editor={editorRef} // Pasar la referencia del editor a la barra de herramientas
        disabled={false}
      />
      <RichEditor
      ref={editorRef}
      containerStyle={styles.rich}
      editorStyle={styles.contentStyle}
      placeholder={"what on your mind?"}
      onChange={onChange}

      />
    </View>
  );
};

export default RichTextEditor;

const styles = StyleSheet.create({
  richBar: {
      borderTopRightRadius:theme.radius.xl,
      borderTopLeftRadius:theme.radius.xl,
      backgroundColor: theme.colors.gray,
  },
  rich:{
    minHeight:240,
    flex:1,
    borderWidth:1.5,
    borderTopWidth:0,
    borderBottomLeftRadius:theme.radius.xl,
    borderBottomRightRadius:theme.radius.xl,
    borderColor: theme.colors.gray,
    padding:5,

  },
  contentStyle:{
    color: theme.colors.textDark,
    placeholder:'gray',
  },
  flatStyle:{
    paddingHorizontal:8,
    gap:3,

  }
  
});
