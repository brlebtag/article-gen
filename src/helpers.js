import translate from '@k3rn31p4nic/google-translate-api';
import { trimEnd, trim } from 'lodash';

export function traduzir(words) {
    return Promise.all(words.map(w => translate.call(this, w.text, {
        to: w.to,
        from: w.from,
    })));
}

export function fixLinha(str) {
    return str.trim().split(/[ \n\t]/g).map(s => s.replace(/ /g, '')).join(' ');
}

export function quebrarChaves(str) {
    return str.split(/[\n\t\;\,\.]/g).map(s => trimEnd(s.trim(), '.'));
}

export function quebrarAutores(str) {
    var autores = str.split(/\n\n/).map(autor => autor.split(/\n/).map(a => a.trim()));

    if (autores.length == 0 || autores.some(a => a == ''))
        return [];

    return autores;
}

export function cloneArr(arr) {
    return arr.slice();
}

export function nome(str) {
    let n = str.split(/[ ]/g);

    return {
        firstName: n[0],
        lastName: n[n.length - 1],
    };
}

export function quebrarLinha(str) {
    return str.split("\n").filter(s => s != '');
}

export function ajustarAcentuacao(str) {
    const acentos = {
        '\'a': 'á',
        '\'e': 'é',
        '\'i': 'í',
        '\'ı': 'í',
        '\'o': 'ó',
        '\'u': 'ú',
        
        '\'A': 'Á',
        '\'E': 'É',
        '\'I': 'Í',
        '\'İ': 'Í',
        '\'O': 'Ó',
        '\'U': 'Ú',

        '\´a': 'á',
        '\´e': 'é',
        '\´i': 'í',
        '\´ı': 'í',
        '\´o': 'ó',
        '\´u': 'ú',

        '\´A': 'Á',
        '\´E': 'É',
        '\´I': 'Í',
        '\´İ': 'Í',
        '\´O': 'Ó',
        '\´U': 'Ú',

        '\~a': 'ã',
        '\~e': 'ẽ',
        '\~i': 'ĩ',
        '\~ı': 'ĩ',
        '\~o': 'õ',
        '\~u': 'ũ',

        '\~A': 'Ã',
        '\~E': 'Ẽ',
        '\~I': 'Ĩ',
        '\~İ': 'Ĩ',
        '\~O': 'Õ',
        '\~U': 'Ũ',

        '\˜a': 'ã',
        '\˜e': 'ẽ',
        '\˜i': 'ĩ',
        '\˜ı': 'ĩ',
        '\˜o': 'õ',
        '\˜u': 'ũ',

        '\˜A': 'Ã',
        '\˜E': 'Ẽ',
        '\˜I': 'Ĩ',
        '\˜İ': 'Ĩ',
        '\˜O': 'Õ',
        '\˜U': 'Ũ',

        '\`a': 'à',
        '\`e': 'è',
        '\`i': 'ì',
        '\`ı': 'ì',
        '\`o': 'ò',
        '\`u': 'ù',

        '\`A': 'À',
        '\`E': 'È',
        '\`I': 'Ì',
        '\`İ': 'Ì',
        '\`O': 'Ò',
        '\`U': 'Ù',

        '\¨a': 'ä',
        '\¨e': 'ë',
        '\¨i': 'ï',
        '\¨ı': 'ï',
        '\¨o': 'ö',
        '\¨u': 'ü',

        '\¨A': 'Ä',
        '\¨E': 'Ë',
        '\¨I': 'Ï',
        '\¨İ': 'Ï',
        '\¨O': 'Ö',
        '\¨U': 'Ü',

        '\^a': 'â',
        '\^e': 'ê',
        '\^i': 'î',
        '\^ı': 'î',
        '\^o': 'ô',
        '\^u': 'û',

        '\^A': 'Â',
        '\^E': 'Ê',
        '\^I': 'Î',
        '\^İ': 'Î',
        '\^O': 'Ô',
        '\^U': 'Û',

        '\ˆa': 'â',
        '\ˆe': 'ê',
        '\ˆi': 'î',
        '\ˆı': 'î',
        '\ˆo': 'ô',
        '\ˆu': 'û',

        '\ˆA': 'Â',
        '\ˆE': 'Ê',
        '\ˆI': 'Î',
        '\ˆİ': 'Î',
        '\ˆO': 'Ô',
        '\ˆU': 'Û',

        '\´A': 'Á',
        '\´E': 'É',
        '\´I': 'Í',
        '\ˆİ': 'Í',
        '\´O': 'Ó',
        '\´U': 'Ú',
        
        '\¸c': 'ç',
        '\¸C': 'Ç',

        '↵': 'ff',
    };

    for(var acento in acentos) {
        const valor = acentos[acento];
        str = str.replace(new RegExp(acento, 'g'), valor);
    }

    return str;
}