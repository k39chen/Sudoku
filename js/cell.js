function Cell(row, col, value) {
  this._row = row;
  this._col = col;
  this._isConstant = value !== undefined;
  this._el = document.createElement('div');

  this._value = value;
  this._annotations = {};

  this._el.id = `cell-${this._row}_${this._col}`;
  this._el.classList = 'cell';
  this._el.setAttribute('data-row', this._row);
  this._el.setAttribute('data-col', this._col);

  const valueEl = document.createElement('div');
  valueEl.classList = 'cell-value';
  valueEl.innerHTML = '';
  this._el.appendChild(valueEl);

  const annotationsEl = document.createElement('div');
  annotationsEl.classList = 'cell-annotations';
  let annotationEl;
  for (let i = 1; i <= 9; i++) {
    annotationEl = document.createElement('div');
    annotationEl.classList = 'cell-annotation';
    annotationEl.setAttribute('data-annotation', i);
    annotationEl.innerHTML = i;
    annotationsEl.appendChild(annotationEl);
  }
  this._el.appendChild(annotationsEl);

  if (this._isConstant) {
    this._el.classList = this._el.classList + ' constant';
    this._el.getElementsByClassName('cell-value')[0].innerHTML = this._value;
  }

  this.getElement = () => {
    return this._el;
  };

  this.hasValue = () => {
    return this._value !== '' & this._value !== undefined;
  };

  this.getValue = () => {
    return this._value;
  };

  this.setValue = (value, force = false) => {
    this._value = !force && this._value === value ? undefined : value;
    this._el.getElementsByClassName('cell-value')[0].innerHTML = this._value || '';

    this._annotations = {};
    this._updateAnnotations();
    this.hideError();
  };
  
  this.bulkAnnotate = (values, force = false) => {
    let value;
    if (force) {
      this._annotations = {};
    }
    for (let i = 0; i < values.length; i++) {
      value = parseInt(values[i], 10);
      if (this._annotations[value]) {
        this._annotations[value] = undefined;
      } else {
        this._annotations[value] = true;
      }
    }
    this._value = undefined;
    this._el.getElementsByClassName('cell-value')[0].innerHTML = '';
    this._updateAnnotations();
    this.hideError();
  };

  this.hasAnnotations = () => {
    return Object.keys(this._annotations).length > 0;
  };
  
  this.hasAnnotation = (value) => {
    return this._annotations[value] === true;
  };
  
  this.annotate = (value) => {
    if (this._annotations[value]) {
      this._annotations[value] = undefined;
    } else {
      this._annotations[value] = true;
    }
    this._value = undefined;
    this._el.getElementsByClassName('cell-value')[0].innerHTML = '';
    this._updateAnnotations();
    this.hideError();
  };

  this.getAnnotations = () => {
    const annotations = [];
    for (let val in this._annotations) {
      annotations.push(val);
    }
    return annotations;
  };
  
  this.showError = () => {
    this._el.setAttribute('data-has-error', true);
  };
  
  this.hideError = () => {
    this._el.removeAttribute('data-has-error');
  };
  
  this.isConstant = () => {
    return this._isConstant;
  };
  
  this.isActive = () => {
    return this._isActive;
  };
  
  this.setActive = () => {
    this._el.setAttribute('active', true);
    this._isActive = true;
  };
  
  this.setInactive = () => {
    this._el.removeAttribute('active');
    this._isActive = false;
  };

  this.highlight = () => {
    this._el.setAttribute('highlighted', true);
  };

  this.unhighlight = () => {
    this._el.removeAttribute('highlighted');
  };

  this._updateAnnotations = () => {
    const annotationEls = this._el.getElementsByClassName('cell-annotation');
    let annotationEl;
    let annotationValue
    for (let i = 0; i < annotationEls.length; i++) {
      annotationEl = annotationEls[i];
      annotationValue = parseInt(annotationEl.getAttribute('data-annotation'), 10);

      if (this._annotations[annotationValue]) {
        annotationEl.style.visibility = 'visible';
      } else {
        annotationEl.style.visibility = 'hidden';
      }
    }
  };
}
