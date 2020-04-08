import React, { useState, useEffect, useMemo, useCallback } from 'react';
import fontFamilies from './Fonts';
import './App.scss';

class FontFaceList {
  fonts: FontFace[];

  constructor (fonts: FontFace[] = []) {
    this.fonts = fonts;
  }

  empty () {
    return this.fonts.length === 0;
  }

  contains (font: FontFace) {
    return this.fonts.some((_font) => {
      return _font.family === font.family;
    });
  }

  toArray () {
    return this.fonts;
  }
}

class Util {
  static loadLocalFont (fontFamilyName:string) {
    const font = new FontFace(`USERFONT-${fontFamilyName.trim()}`, `local(${fontFamilyName})`);
    return font.load().then(() => font, () => font);
  }

  static fontLoaded (font: FontFace|null) {
    if (font === null) {
      return false;
    }
    if (font.status === 'loaded') {
      return true;
    } else {
      return false;
    }
  }
}

interface FontRowElementProps {
  font: FontFace,
  sampleText: string
}

const FontRowElement = ({font, sampleText}: FontRowElementProps) => {
  let installedText = "";
  if (Util.fontLoaded(font)) {
    installedText = "●";
  }

  return (
    <tr>
      <td style={{fontFamily:font.family}}>{font.family.substring(9)}</td>
      <td className="column-installed">
        {installedText}
      </td>
      <td className="column-sample-text" style={{fontFamily:font.family}}>
        {sampleText}
      </td>
    </tr>
  );
};

interface FontTableElementProps {
  installedFontList: FontFaceList,
  sampleText: string
}

const FontTableElement = ({installedFontList, sampleText}: FontTableElementProps) => {
  if (installedFontList.empty()) {
    return <></>;
  }

  return (
    <table className="table is-narrow is-fullwidth is-striped">
      <thead><tr><th>Font Family</th><th className="has-text-centered">Installed</th><th>Sample</th></tr></thead>
      <tbody>
        <>
          {installedFontList.toArray().map((font, index) => 
            <FontRowElement key={index} font={font} sampleText={sampleText}/>
          )}
        </>
      </tbody>
    </table>
  );
};

interface FontInputElementProps {
  inputFont: string,
  setInputFont: React.Dispatch<React.SetStateAction<string>>,
  inputFontFace: FontFace|null,
  addUserFont: () => void,
  sampleText: string
}

const FontInputElement = ({inputFont, setInputFont, inputFontFace, addUserFont, sampleText}: FontInputElementProps) => {
  const fontInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputFont(e.target.value);
  };

  const fontStyle = useMemo(() => {
    if (inputFontFace === null) {
      return {};
    }
    return {fontFamily: inputFontFace.family};
  }, [inputFontFace]);

  let installedText = "Not installed";
  let installedTextClass = "has-text-danger";
  if (Util.fontLoaded(inputFontFace)) {
    installedText = "Installed";
    installedTextClass = "has-text-success";
  }

  return (
    <div className="box">
      <div className="columns is-vcentered">
        <div className="column is-narrow">
          <div>Input font-family name</div>
          <div className="field has-addons">
            <div className="control">
              <input className="input" type="text" value={inputFont} onChange={fontInputHandler} placeholder="Arial, Helvetica, etc..."/>
            </div>
            <div className="control">
              <button className="button is-info" onClick={addUserFont}>Add</button>
            </div>
          </div>
        </div>
        <div className={"column"}>
          <div className={installedTextClass}>{installedText}</div>
          <div className="is-size-5 user-sample-text" style={fontStyle}>{sampleText}</div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [inputFont, setInputFont] = useState('');
  const [inputFontFace, setInputFontFace] = useState<FontFace|null>(null);

  const [inputText, setInputText] = useState('');

  const [installedFontList, setInstalledFontList] = useState(new FontFaceList());
  const [userInstalledFontList, setUserInstalledFontList] = useState(new FontFaceList());

  const addUserFont = () => {
    setUserInstalledFontList((state) => {
      if (inputFontFace === null) {
        return state;
      }
      return new FontFaceList([inputFontFace, ...state.toArray()]);
    })
  };

  useEffect(() => {
    let canceled = false;

    (async () => {
      const font = await Util.loadLocalFont(inputFont);
      if (canceled) {
        return;
      }
      if (font.status === 'loaded' && !installedFontList.contains(font) && !userInstalledFontList.contains(font)) {
        document.fonts.add(font);
      }
      setInputFontFace(font);
    })();

    return () => {
      canceled = true;
    };
  }, [inputFont]);

  useEffect(() => {
    (async () => {
      const installedFonts = await Promise.all(fontFamilies.map((fontFamilyName) => {
        return Util.loadLocalFont(fontFamilyName);
      }));
      installedFonts.forEach((font) => {
        document.fonts.add(font);
      });
      setInstalledFontList(new FontFaceList(installedFonts));
    })();
  }, []);

  const sampleText = useMemo(() => {
    if (inputText === '') {
      return 'sample text';
    } else {
      return inputText;
    }
  }, [inputText]);

  const textInputHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  }, []);

  return (
    <div className="App container">
      <header className="level">
        <div className="is-size-3 has-text-white has-text-weight-semibold">
          Local Font Tester
        </div>
        <div className="has-text-white">
          Sample Text
          <input className="input text-input" type="text" value={inputText} onChange={textInputHandler} placeholder="sample text"></input>
        </div>
      </header>
      <FontInputElement inputFont={inputFont} setInputFont={setInputFont} inputFontFace={inputFontFace} addUserFont={addUserFont} sampleText={sampleText}/>
      <FontTableElement installedFontList={userInstalledFontList} sampleText={sampleText}/>
      <div className="has-text-white">Popular Fonts</div>
      <FontTableElement installedFontList={installedFontList} sampleText={sampleText}/>
      <footer className="has-text-centered">
        <a className="has-text-white" href="https://github.com/semi65535/local-font-tester">Github</a>
      </footer>
    </div>
  );
}

export default App;
