/* eslint-disable */
// import * as THREE from "https://cdn.skypack.dev/three@0.132.0/build/three.module.js";
import { storyStage } from '../js/storyStage.js';
import { story } from '../js/story.js';
import Event from '../libs/Events.js';

class introStory extends story {
  storyCopleted = false;
  events = new Event();
  bodyObj;

  constructor(sc, c) {
    super(sc, c);
    this.init();
  }

  init() {
    this.currentStage = new storyStage(this.scene, window.CANVAS_ASSET_ROOT + 'intro/intro.json');
    this.bodyObj = this.currentStage.sceneObjects[0];
  }

  load() {
    // if (!loader.style.visibility) loader.style.visibility = 'visible';

    let proc = this.currentStage.readyCheck();
    proc = proc * 100;
    if (!proc) proc = 0;

    this.events.fire(this.canvas, 'canvas:loading', {
      percent: proc.toFixed(),
    });

    // this.loader.innerText = proc.toFixed() + '%';

    if (proc >= 100) {
      this.events.fire(this.canvas, 'canvas:loaded', {
        percent: proc.toFixed(),
      });
    }

    // if (this.currentStage.ready) loader.style.visibility = 'hidden';
    if (this.currentStage.ready && !this.currentStage.visible) this.currentStage.show();
  }

  update() {
    if (!this.currentStage.ready) this.load();
    if (this.currentStage.ready && !this.transition) this.currentStage.update(this.animationProgress);
  }

  startAnim() {
    this.animateTween.onComplete(() => {
      this.storyCopleted = true;
    });
    if (this.animationProgress == 0) this.animateTween.to({ animTween: 1 }, this.currentStage.duration).start();
    // if (this.currentStage.complete && !this.transition) this.sceneTransition();
  }

  sceneTransition() {
    // this.params.animTween = 0;
    // this.params.transTween = 0;
    // this.transition = true;
    // let transInTween = new TWEEN.Tween(this.params)
    //   .to({ transTween: 1 }, 200)
    //   .easing(TWEEN.Easing.Quadratic.Out)
    //   .onComplete(() => {
    //     this.transition = false;
    //     TWEEN.remove(transInTween);
    //   })
    //   .onUpdate(() => {
    //     this.currentStage.stageContainer.position.z = this.currentStage.startPosition.z - 1000 + this.params.transTween * 1000;
    //   });
    // let transOutTween = new TWEEN.Tween(this.params)
    //   .to({ transTween: 1 }, 500)
    //   .easing(TWEEN.Easing.Quadratic.In)
    //   .onComplete(() => {
    //     this.switchScene();
    //     this.currentStage.stageContainer.position.z = this.currentStage.startPosition.z - 1000;
    //     transInTween.start();
    //     TWEEN.remove(transOutTween);
    //   })
    //   .onUpdate(() => {
    //     this.currentStage.stageContainer.position.z = this.currentStage.targetPosition.z + this.params.transTween * 1000;
    //   })
    //   .start();
  }

  switchScene() {
    // this.params.transTween = 0;
    // this.animationProgress = 0;
    // this.currentStage.hide();
    // this.currentStageNo++;
    // if (this.currentStageNo >= this.stageList.length) this.currentStageNo = 0;
    // this.nextStageNo++;
    // if (this.nextStageNo >= this.stageList.length) this.nextStageNo = 0;
    // this.currentStage = this.stageList[this.currentStageNo];
    // this.nextStage = this.stageList[this.nextStageNo];
    // console.log('current stage: ' + this.currentStageNo + ' next stage: ' + this.nextStageNo);
    // this.nextStage.hide();
    // this.currentStage.reset();
    // this.currentStage.update(this.animationProgress);
    // this.currentStage.show();
  }
}

export { introStory };
