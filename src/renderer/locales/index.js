import Vue from 'vue'
import VueI18n from 'vue-i18n'
// let endata = require('./en.json')
let zhcndata = require('./zh-cn.json')
// let hkdata = require('./zh-hk')

Vue.use(VueI18n)

// language const variable
export const ZH_CN = {
  key: 'zh_cn',
  label: '简体中文',
  img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAKfSURBVHja7Je7bhNREIa/s7uOnYtjAYqQaOioQKJECtR06SgQouUxKLi8Qd6AAqVGVAhRIJ6AAhAdIkERYCex1/buzpmhWF/Wlk0Uxdk0mWZ3j+bo/DP/zH9mnZlxnhZwznYBwAEhUB08yzQPJBGwvvvgYdOFs5PhakbQMPz+gpPlAq69fnU5AhoucNTubs70izaM6m1P/D4CXdz56ddvAI0IqJr3kKbo4RHDtnTO5Y4txf8yfDMYrRd9ZrXxcO88v6CxDmkCUI0AEMV6fayf5FFfV2Q3AMk3SAeCVWNlK6P/KUJ+5GDmKYgd800/gcznZwGYF0y6GF0IYHUr4WC7CgaWDKIR6H1QtCVo350u/0sRlmVjAIigcY/lzTYr9zMsdVx5GtN9VyF+WxlFkX5ZDP8WhaiXAgDv0VaH9k5KeCmldk/of4xo7xiQ5jxGsHTTIz8D/J9TZsCAJB0D0EzQuIP1epgl7D+psP44xnoyJnDNqN1Jid9EWPd0kqEYlqZFCjK0HUOlR/OlA/M0X4Bb7kDgCNcV2QtpPh/qhw00zAp6RmGdqe/JdecVK2bARNBOB0uSYR+BGXRg6YZSf5Tx91kt14FhOw1aDbPx+7Gpz32dCEhWBOAh7owqs2jZdzjcNiyO5/fdSS1LIQwnKZA4hhkA/AFkewu+BSoVwnp9sgjxHlQLnB7H5zz+bWpt1jXkUZHJGnBqmNrUxnmaZnN0zv5/8BCyGpZNAzArZOCMzQzLCl0gIlTMsBIBiBTuAhWBKBq32JmPQQ5frAEdRl7ihKzqxzOhVz+6w8tJgBsFHQDoSdRsQRQMAUSjycU5grW1EimwEQCvBq2jo1JH4kG1eQdcBW4BGyWP5b+Bz27wT1AfPMu0BGi7i5/T8wbwbwD6HHepwTz9DwAAAABJRU5ErkJggg=='
}
export const EN = {
  key: 'en',
  label: 'English',
  img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAALESURBVHja7Jc/aBNxFMc/l0STtqYtihgkYLOYitjuFuwiUgfBUOgSOqS6CNqmRRqLmyjBBDQ4FLRL/TOokEEhgyC4O7RSB0MHWxEtWLGtrW2Su/s9h8ZeUlF7rV4XHzy+995v+d77vnf3fpqIsJ3mYpvtPwENcAPeMjppJlD0APXHj9/44nZvrhh3d45tsvYuAk9GdwM0nTiRkZmZb3L9+jPbuBUDmjyA1zAUIyMviMXaSaVzDPSfJJ3O0V+JqRz9A1acSufQgC+XrlpvJRXCVua06nNXYz36m0kArwtAKUVPTzvJ5FPifR0kk0/pW4/x6jje10GhoEOhaHmx7OtzP50XQDfWOIbb2lISjz+SqakFicVGN4yx2OhWJQh7AAzDJB7vYHDwEclkF4nExnBo6DGz3Rfs959/F8aHGQDKBBSJxEOuXeuit/cemUz3hhBA6d82NfxSKlkStLZekcnJeTl2LC35/Jwt/CsS6LpJT88d7oycJRod5sH9c0Sjw9z/A4Lw8egp0MptLmI9V8br8prPB8WCJYGuK27fPkPk9E2y2T5ORzJks71EIqtxZC2uznd23kJ8y9Vj9zv7MZKGjlROQSg0JKHQZZmYmJVgMLFhDAYTW5YAIBwMJmR8/JPU1Z2XsTF7OL3nkH0PtMj7g20ChDUgHAhczC8tlTAM03ZD52ue258CjwfNX8eBty+bNSBsmmbe5XL2z6yUwu12N3sApve34jFMpKQ7swPs3IGxw2NNgTINRARRpv1tQtbFld3+q3VT3CjTsAgE34/j8/kclWBlZQVqa1cJTO89TI3XiyyvOCNBbQ3LpaK1E5pKVX/B/jkDDaWkQoKPr2hoaHBUgoWFBWhsXCXwLtBCY73fUQJzXxfXKmDqfpPPMu8oAfEDBUwN2AccAfY6vJbPAq+18p3AX0YnrQgsav8vp9tN4PsALYQJa7MTgzkAAAAASUVORK5CYII='
}

export const ZH_HK = {
  key: 'zh_hk',
  label: '港澳繁體',
  img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAPrSURBVHja7JdPaFxVFMZ/d+bNZCYmmbSlTRpTkGJoYtJNoVhDBV2IoBvFFqq0hRSroou0RBFLQXBf1IDSYjZaaFE3xY2iomjqn71aY7QxpknaZEIyncybN/Pevfe4mMlkMp00yWay6YXDfe9xzznfved8556nRITNHCE2edwDoIAwUFecazkMkHeApqnDz8+rcI39K0Xb5YtbHSChQiFiB3tr6t8fGQVIOECdGAO+j72dZomWSikAKmmqlFqxphqNK3Ur14USTeDnAeocALRBvBySy5cWrVYdZJVn7vL9jnW5PAQaAAdAjMbmcthcbkPHGNnVTrSnG+/HYaybXb9iNIKUA0AbJOsi3vqNxA72kjh2lOzwT5i5uQ0BFyeENeUAjMGm3XXvwtnZSuLYUbzhq9R1dZHWZkX41kagIO8vA7BBgHUzSNZbpVyFwNrSa/3jj2Hm57FBgGpqQjKLYAVicSSTWdO/RRDfLw+Bxi66yB05IICi4chzmKmbiO+TvzaCzbqI7xPfv59k/2liBw7QcOhZIm1t+KOjpC4M4V/7q6S/PBdZYixSfgKiNTaTQfL5UpFgiTZKEevsJHaiD5vJoCdusHDufer27SN5+g2iPd00v/YKNp1mfvADmvqOs+O9c0wfOoK+NVuxHwGlUFqDDpbvAtEacTOIly1IMSGXnm9f+hSA1IUhog91YbNZ5s6cxczNoW9MMts/gB4fp/nVl8HLMXvqdQiFCnbKZcm2m0G0XhkC7boQBFVj5n75FYuXP2PrwCmC8f/YMtBPavBDcmP/omJx7nvyCRbOD2FvpwgmJjHJ5Br8jRBubCxPQg3GlCVaZdyE5JmzLF75gvpHe9HTN/Gv/0O89xH8P/4k0rmHxIt9TD1zGDMzs0Kv+jVksJUhUFYKmWylAKQ0F8VYcr/8ivvNd4Tb20m8dJJt77yNs6udcGsL/tgYrZc+RkUiZXpSVZQVJDDlAIJCgpQ7rCLOju20XfmcaMeDxHsfxqZSqHiMWE83qfMf4TRvIdrVtaYdRJDAXwagtUFEEGtXFaJR6p9+CgXYhQWiHR2kP7mId/Vn3K+/pWXwXQgp9MzsXe2ItYgIWpuyHNAaHGeZetWubyeMs7OV4O/rRHbvZvqF43jf/wDArRMn2fbWm6j6evTExLp6AVNkgQL2/N72wEg8GkU8b23lcLiQsJXluf1+zMwssgqTVviPx8kGPnunxjsdAGNN4c5eVyNlqn7Wk1MbaIYUtsi4EIAtVqhatmNLAJxS56IUoYaGmmGwVkoAjBVYSKdr2hMWw20U0ALsBbbXuC1PAr+p4j9BY3Gu5cgDi+rez+lmA/h/ACnUZ/8+AhyUAAAAAElFTkSuQmCC'
}

export const ZH_TW = {
  key: 'zh_tw',
  label: '台灣正體'
}

export const LANGUAGES = [
  EN,
  ZH_CN,
  ZH_HK
]

export const MOMENT_LANGUAGES = {
  'zh_cn': 'zh-cn',
  'en': 'en',
  'zh_hk': 'zh-hk',
  // 'zh_tw': 'zh-tw'
  
}

export function getDeviceLanguage(){
  return new Promise((resolve,reject) => {
    navigator.globalization.getLocaleName(locale=>{
        let val = locale.value
        if (['zh','zh-CN'].includes(val)) {
          resolve(ZH_CN)
        }else if('zh-HK' === val){
          resolve(ZH_HK)
        }else if('zh-TW' === val){
          resolve(ZH_HK)
        } else {
          resolve(EN)
        }
      },()=>{
        //reject()
        resolve(ZH_CN)
      }
    );
  })
}


export const i18n = new VueI18n({
  locale: ZH_CN.key,
  messages: {
    // [EN.key]: endata,
    [ZH_CN.key]: zhcndata,
    // [ZH_HK.key]: hkdata,
    // [ZH_TW.key]: twdata
  }
})

export const RandomPlanetsCount = 9
export const RandomColorsCount = 9

