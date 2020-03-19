import React, { useState, useEffect } from 'react';
import fontFamilies from './Fonts';
import './App.scss';

class FontFaceList {
  fonts: FontFace[];

  constructor (fonts: FontFace[] = []) {
    this.fonts = fonts;
  }

  contains (font: FontFace): Boolean {
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

  static displayFontStatus (font: FontFace|null): string {
    if (font === null) {
      return '';
    }
    if (font.status === 'loaded') {
      return '●';
    } else {
      return '';
    }
  }
}

const App = () => {
  const [inputFont, setInputFont] = useState('');
  const [inputFontFace, setInputFontFace] = useState<FontFace|null>(null);

  const [inputText, setInputText] = useState('');

  const [testFontList, setTestFontList] = useState(fontFamilies);

  const [installedFontList, setInstalledFontList] = useState(new FontFaceList());

  useEffect(() => {
    let canceled = false;

    (async () => {
      const font = await Util.loadLocalFont(inputFont);
      if (canceled) {
        return;
      }
      if (font.status === 'loaded' && !installedFontList.contains(font)) {
        document.fonts.add(font);
      }
      setInputFontFace(font);
    })();

    return () => {
      canceled = true;
    };
  }, [installedFontList, inputFont]);

  useEffect(() => {
    let canceled = false;

    (async () => {
      const installedFonts = await Promise.all(testFontList.map((fontFamilyName) => {
        return Util.loadLocalFont(fontFamilyName);
      }));
      if (!canceled) {
        setInstalledFontList(new FontFaceList(installedFonts));
      }
    })();

    return () => {
      canceled = true;
    };
  }, [testFontList]);

  const sampleText = (() => {
    if (inputText === '') {
      return 'sample text';
    } else {
      return inputText;
    }
  })();

  const FontListElements = () => {
    const list: JSX.Element[] = [];

    installedFontList.toArray().forEach((font, index) => {
      document.fonts.add(font);
      list.push(
        <tr key={index}>
          <td className="column-font-family" style={{fontFamily:font.family}}>{font.family.substring(9)}</td>
          <td className="column-installed">
            {Util.displayFontStatus(font)}
          </td>
          <td className="column-sample-text" style={{fontFamily:font.family}}>
            {sampleText}
          </td>
        </tr>
      );
    });

    return list;
  };

  const FontTableElement = () => {
    const fontInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputFont(e.target.value);
    };
    const fontInput = <input className="input is-small" type="text" value={inputFont} onChange={fontInputHandler} placeholder="Arial, Helvetica, etc..."></input>;

    const addButtonHandler = () => {
      const input = inputFont.trim();
      if (input === '') {
        return;
      }
      setTestFontList((state) => {
        return [input, ...state];
      });
    };
    const addButton = <button className="button is-small is-info" onClick={addButtonHandler}>Add</button>;

    const fontStyle = (() => {
      if (inputFontFace === null) {
        return {};
      }
      return {fontFamily: inputFontFace.family};
    })();

    return (
      <table className="table is-narrow is-fullwidth is-striped">
        <thead><tr><th>Font Family</th><th className="has-text-centered">Installed</th><th>Sample</th></tr></thead>
        <tbody>
          <tr>
            <td className="column-font-family"><div className="field has-addons"><div className="control">{fontInput}</div><div className="control">{addButton}</div></div></td>
            <td className="column-installed">{Util.displayFontStatus(inputFontFace)}</td>
            <td className="column-sample-text" style={fontStyle}>{sampleText}</td>
          </tr>
          {FontListElements()}
        </tbody>
      </table>
    );
  };

  const textInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };
  const textInput = <input className="input text-input" type="text" value={inputText} onChange={textInputHandler} placeholder="sample text"></input>;

  return (
    <div className="App">
      <header className="level">
        <div className="is-size-3 has-text-white has-text-weight-semibold">
          Local Font Tester
        </div>
        <div className="has-text-white">
          Sample Text
          {textInput}
        </div>
      </header>
      {FontTableElement()}
      <footer className="has-text-centered">
        <a className="has-text-white" href="https://github.com/semi65535/local-font-tester">Github</a>
      </footer>
    </div>
  );
}

export default App;
