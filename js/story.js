/* eslint-disable */
// import * as THREE from "https://cdn.skypack.dev/three@0.132.0/build/three.module.js";
import { storyStage } from './storyStage.js';
import { storyStage03 } from '../covidStory/storyStage03.js';
import Event from '../libs/Events.js';

class story {
  canvas;
  currentStage;
  currentStageNo = 0;
  nextStageNo = 1;
  stageList = [];

  readyStagesCount = 0;
  allStagesReady = false;
  loadStory = false;
  loading = false;
  loaded = false;
  transition = false;
  nextStage;

  animationProgress = 0;

  tween = eval('TWEEN.Easing.Quadratic.InOut');

  // loader = document.getElementById('loader');

  params = {
    animTween: 0,
  };

  events = new Event();

  animateTween = new TWEEN.Tween(this.params)
    .to({ animTween: 1 })
    .easing(this.tween)
    .onComplete(() => {
      this.currentStage.complete = true;
    })
    .onUpdate(() => {
      this.animationProgress = this.params.animTween;
    });

  constructor(sc, c) {
    this.scene = sc;
    this.canvas = c;
    // this.init();
  }

  init() {
    this.loading = true;
    // this.loader.style.visibility = 'visible';
    // this.loader.innerText = '0%';

    const stage01 = new storyStage(this.scene, window.CANVAS_ASSET_ROOT + 'covidStory/data/stage01.json');
    this.stageList.push(stage01);
    const stage02 = new storyStage(this.scene, window.CANVAS_ASSET_ROOT + 'covidStory/data/stage02.json');
    this.stageList.push(stage02);
    const stage03 = new storyStage03(this.scene, window.CANVAS_ASSET_ROOT + 'covidStory/data/stage03.json');
    this.stageList.push(stage03);
    const stage04 = new storyStage(this.scene, window.CANVAS_ASSET_ROOT + 'covidStory/data/stage04.json');
    this.stageList.push(stage04);

    this.currentStage = this.stageList[this.currentStageNo];
    let nxt = this.currentStageNo + 1;
    if (nxt >= this.stageList.length) nxt = 0;
    this.nextStage = this.stageList[this.currentStageNo + 1];

    this.loadStory = true;
  }

  load() {
    this.loading = true;
    this.readyScenesCount = 0;
    let proc = 0;
    for (let i = 0; i < this.stageList.length; i++) {
      proc += this.stageList[i].readyCheck();
      if (this.stageList[i].ready) {
        this.readyScenesCount++;
      }
    }
    proc = (proc * 100) / this.stageList.length;
    if (!proc) proc = 0;
    // this.loader.innerText = proc.toFixed() + '%';

    this.events.fire(this.canvas, 'canvas:scene-loading', {
      percent: proc.toFixed(),
    });
    if (this.readyScenesCount >= this.stageList.length) {
      this.events.fire(this.canvas, 'canvas:scene-loaded', {
        percent: proc.toFixed(),
      });
      this.allStagesReady = true;
      this.loadStory = false;
      this.loaded = true;
    }
    // if (this.allStagesReady) loader.style.visibility = 'hidden';
    if (this.allStagesReady && !this.currentStage.visible) this.currentStage.show();
  }

  update() {
    if (this.loadStory && this.loading) this.load();
    if (this.allStagesReady && !this.transition) this.currentStage.update(this.animationProgress);
  }

  startAnim() {
    if (this.animationProgress == 0) this.animateTween.to({ animTween: 1 }, this.currentStage.duration).start();
    if (this.currentStage.complete && !this.transition) this.sceneTransition();
  }

  sceneTransition() {
    this.params.animTween = 0;
    this.params.transTween = 0;

    this.transition = true;

    let transInTween = new TWEEN.Tween(this.params)
      .to({ transTween: 1 }, 200)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(() => {
        this.transition = false;
        TWEEN.remove(transInTween);
      })
      .onUpdate(() => {
        this.currentStage.stageContainer.position.z = this.currentStage.startPosition.z - 1000 + this.params.transTween * 1000;
      });

    let transOutTween = new TWEEN.Tween(this.params)
      .to({ transTween: 1 }, 500)
      .easing(TWEEN.Easing.Quadratic.In)
      .onComplete(() => {
        this.switchScene();
        this.currentStage.stageContainer.position.z = this.currentStage.startPosition.z - 1000;
        transInTween.start();
        TWEEN.remove(transOutTween);
      })
      .onUpdate(() => {
        this.currentStage.stageContainer.position.z = this.currentStage.targetPosition.z + this.params.transTween * 1000;
      })
      .start();
  }

  switchScene() {
    this.params.transTween = 0;
    this.animationProgress = 0;
    this.currentStage.hide();
    this.currentStageNo++;
    if (this.currentStageNo >= this.stageList.length) this.currentStageNo = 0;
    this.nextStageNo++;
    if (this.nextStageNo >= this.stageList.length) this.nextStageNo = 0;
    this.currentStage = this.stageList[this.currentStageNo];
    this.nextStage = this.stageList[this.nextStageNo];
    console.log('current stage: ' + this.currentStageNo + ' next stage: ' + this.nextStageNo);
    this.nextStage.hide();
    this.currentStage.reset();
    this.currentStage.update(this.animationProgress);
    this.currentStage.show();
  }
}

export { story };
