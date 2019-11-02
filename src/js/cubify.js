class Cubify {
  constructor(front, options) {
    // set options
    this.front = front;
    this.faces = options.faces || {};
    this.width = options.width || this.getDefaultWidth();
    this.onlyX = options.onlyX || false;
    this.onlyY = !!options.onlyX ? false : options.onlyY || false;
    this.interactive = options.interactive || false;
    this.snap = options.snap || false;

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
  calculateDeltaAngles(event, x, y) {
    let deltaX = 0;
    let deltaY = 0;

    if (event.type === "touchmove") {
      if (!this.onlyY) deltaX = x - event.touches[0].clientX;
      if (!this.onlyX) deltaY = y - event.touches[0].clientY;
    } else {
      if (!this.onlyY) deltaX = x - event.clientX;
      if (!this.onlyX) deltaY = y - event.clientY;
    }
    const deltaAngleX = this.angleX - deltaX / 2;
    const deltaAngleY = this.angleY + deltaY / 2;

    return [deltaAngleX, deltaAngleY];
  }
  renderNewAngles(newAngleX, newAngleY) {
    this.cube.style.transform = `translateZ(-${this.width /
      2}px) rotateY(${newAngleX}deg) rotateX(${newAngleY}deg)`;
  }
  rotate(event, x0, y0, listenerCallback) {
    let deltaAngles = this.calculateDeltaAngles(event, x0, y0);
    if (event.type === "mouseup" || event.type === "touchend") {
      document.removeEventListener(
        event.type === "mouseup" ? "mousemove" : "touchmove",
        listenerCallback
      );
      document.removeEventListener(
        event.type === "mouseup" ? "mouseup" : "touchend",
        listenerCallback
      );
      if (!!this.snap) deltaAngles = this.snapAngles(...deltaAngles);
      return this.setAngles(...deltaAngles);
    }
    this.renderNewAngles(...deltaAngles);
  }
  snapAngles(deltaAngleX, deltaAngleY) {
    let calcSnapped = angle => {
      let remainder = angle % 90;
      let snappedAngle =
        Math.abs(remainder) > 45
          ? (90 - Math.abs(remainder)) * (remainder / Math.abs(remainder))
          : -remainder;
      return snappedAngle;
    };
    let snappedDeltaX = calcSnapped(deltaAngleX);
    let snappedDeltaY = calcSnapped(deltaAngleY);

    deltaAngleX += snappedDeltaX;
    deltaAngleY += snappedDeltaY;

    this.renderNewAngles(deltaAngleX, deltaAngleY);

    return [deltaAngleX, deltaAngleY];
  }
  setAngles(deltaAngleX, deltaAngleY) {
    if (!this.onlyY) this.angleX = deltaAngleX;
    if (!this.onlyX) this.angleY = deltaAngleY;
  }
  setUpListeners() {
    this.cube.addEventListener(
      "touchstart",
      e => {
        e.preventDefault();
        const x0 = e.touches[0].clientX;
        const y0 = e.touches[0].clientY;

        let rotate = event => this.rotate(event, x0, y0, rotate);

        document.addEventListener("touchmove", rotate);
        document.addEventListener("touchend", rotate);
      },
      { passive: false }
    );

    this.cube.addEventListener("mousedown", e => {
      e.preventDefault();
      const x0 = e.clientX;
      const y0 = e.clientY;

      let rotate = event => this.rotate(event, x0, y0, rotate);

      document.addEventListener("mousemove", rotate);
      document.addEventListener("mouseup", rotate);
    });
  }
}
