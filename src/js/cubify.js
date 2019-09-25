class Cubify {
  constructor(
    front,
    options = {
      interactive: false
    }
  ) {
    this.front = front;
    this.faces = options.faces || {};
    this.width = options.width || this.getDefaultWidth();
    this.parent = this.front.parentNode;
    this.bgColor = this.getBackgroundColor();
    this.commonStyle = {
      width: `${this.width}px`,
      height: `${this.width}px`
    };
    this.sceneStyle = {
      perspective: `${this.width * 4}px`
    };
    this.faceStyle = {
      position: "absolute",
      top: 0,
      left: 0
    };
    this.cubeStyle = {
      transform: `translateZ(-${this.width / 2}px)`,
      "transform-style": `preserve-3d`
    };
    this.interactive = options.interactive;
    this.renderCube();
    if (options.interactive) {
      (this.angleX = 0), (this.angleY = 0);
      this.setUpListeners();
    }
  }
  getBackgroundColor() {
    return window
      .getComputedStyle(this.front, null)
      .getPropertyValue("background-color");
  }
  getDefaultWidth() {
    let dimensions = [];
    let pushDimensions = element => {
      if (!element) {
        return;
      } else {
        dimensions.push(element.offsetWidth, element.offsetHeight);
      }
    };
    pushDimensions(this.front);
    pushDimensions(this.faces.back);
    pushDimensions(this.faces.right);
    pushDimensions(this.faces.top);
    pushDimensions(this.faces.bottom);
    pushDimensions(this.faces.left);

    return Math.max(...dimensions);
  }
  generateDOM(style, className, elementNode) {
    const element = elementNode || document.createElement("div");
    element.classList.add(className);
    if (typeof style === "string") {
      this.setStyle(element, style);
      return element;
    }
    const concatStyle = Object.assign({}, this.commonStyle, style);
    const styleKeys = Object.keys(concatStyle);
    const styleString = styleKeys
      .map(key => `${key}: ${concatStyle[key]};`)
      .join(" ");
    this.setStyle(element, styleString);
    return element;
  }
  setFaceStyle(face, rotateAxis = "X", degree = 0) {
    return (face.style.transform = `rotate${rotateAxis}(${degree}deg) translateZ(${this
      .width / 2}px)`);
  }
  setStyle(element, style) {
    return element.setAttribute("style", style);
  }
  composeCube() {
    const scene = this.generateDOM(this.sceneStyle, "cubify__scene");
    const cube = this.generateDOM(this.cubeStyle, "cubify__cube");

    const front = this.generateDOM(this.faceStyle, "cubify__face", this.front);

    const back = !this.faces.back
      ? this.generateDOM(this.faceStyle, "cubify__face")
      : this.generateDOM(this.faceStyle, "cubify__face", this.faces.back);
    const top = !this.faces.top
      ? this.generateDOM(this.faceStyle, "cubify__face")
      : this.generateDOM(this.faceStyle, "cubify__face", this.faces.top);
    const bottom = !this.faces.bottom
      ? this.generateDOM(this.faceStyle, "cubify__face")
      : this.generateDOM(this.faceStyle, "cubify__face", this.faces.bottom);
    const right = !this.faces.right
      ? this.generateDOM(this.faceStyle, "cubify__face")
      : this.generateDOM(this.faceStyle, "cubify__face", this.faces.right);
    const left = !this.faces.left
      ? this.generateDOM(this.faceStyle, "cubify__face")
      : this.generateDOM(this.faceStyle, "cubify__face", this.faces.left);

    this.setFaceStyle(front, "Y", 0);
    this.setFaceStyle(back, "Y", 180);
    this.setFaceStyle(top, "X", 90);
    this.setFaceStyle(bottom, "X", -90);
    this.setFaceStyle(right, "Y", 90);
    this.setFaceStyle(left, "Y", -90);

    cube.append(front, back, top, bottom, left, right);
    scene.append(cube);

    this.cube = cube;

    return scene;
  }
  renderCube() {
    this.parent.append(this.composeCube());
  }
  rotateCube(event, x, y) {
    let deltaX;
    let deltaY;
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      deltaX = x - event.touches[0].clientX;
      deltaY = y - event.touches[0].clientY;
    } else {
      deltaX = x - event.clientX;
      deltaY = y - event.clientY;
    }
    const deltaAngleX = this.angleX - deltaX / 2;
    const deltaAngleY = this.angleY + deltaY / 2;
    this.cube.style.transform = `translateZ(-${this.width /
      2}px) rotateY(${deltaAngleX}deg) rotateX(${deltaAngleY}deg)`;
    return [deltaAngleX, deltaAngleY];
  }

  setAngles(deltaAngleX, deltaAngleY) {
    this.angleX = deltaAngleX;
    this.angleY = deltaAngleY;
  }
  setUpListeners() {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      this.cube.addEventListener("touchstart", e => {
        e.preventDefault();
        const x0 = e.touches[0].clientX;
        const y0 = e.touches[0].clientY;
        let deltaAngles;
        const rotate = event => {
          event.preventDefault();
          deltaAngles = this.rotateCube(event, x0, y0);
          return this.rotateCube(event, x0, y0);
        };
        const onDone = () => {
          this.setAngles(...deltaAngles);
          document.removeEventListener("touchmove", rotate);
          document.removeEventListener("touchend", onDone);
        };
        document.addEventListener("touchmove", rotate, { passive: false });
        document.addEventListener("touchend", onDone);
      });
    } else {
      this.cube.addEventListener("mousedown", e => {
        e.preventDefault();
        const x0 = e.clientX;
        const y0 = e.clientY;
        let deltaAngles;
        const rotate = event => {
          deltaAngles = this.rotateCube(event, x0, y0);
          return this.rotateCube(event, x0, y0);
        };
        const onDone = () => {
          this.setAngles(...deltaAngles);
          document.removeEventListener("mousemove", rotate);
          document.removeEventListener("mouseup", onDone);
        };
        document.addEventListener("mousemove", rotate);
        document.addEventListener("mouseup", onDone);
      });
    }
  }
}
