# fetch-scheduler

Large-scale fetch request scheduling library

### DEMO

[2000 tiles  request  count test](https://deyihu.github.io/fetch-scheduler/test/index.html)

## Install

### NPM

```sh
npm i fetch-scheduler
# or
yarn add fetch-scheduler
```

### CDN

```html
<script src="https://unpkg.com/fetch-scheduler/dist/fetch-scheduler.js"></script>
```

## API

## FetchScheduler 

* constructor(options)

```js
import {
    FetchScheduler
} from 'fetch-scheduler';
const fetchScheduler = new FetchScheduler({
    requestCount: 6 //Concurrent number of fetch requests
});

// if you use cdn 
// const fdnd = new fs.FetchScheduler({...});
```

* methods 

  + createFetch(url, fetchOptions) `create a fetch,return a Promise`

  

```js
const promise = fetchScheduler.createFetch('http://abc.com', {
    // ...
});
promise.then(res => {
    res.json()
}).then(json => {
    // ....
}).catch(err => {
    //...
})

// promise.cancel(); cancel fetch request
// promise.remove(); //remove promise from fetchScheduler
```

  + getCurrentInfo() `get current fetchScheduler statistical information`

```js
  const info = fetchScheduler.getCurrentInfo();
  console.log(info);
```
