Array.prototype.removeAt = function removeAt<T>(this: Array<T>, index: number): boolean {
  for(let i = index+1; i < this.length; i++) {
    this[i-1] = this[i];
  }
  
  this.pop();
  return true;
}

Array.prototype.remove = function remove<T>(this: Array<T>, item: T): boolean {
  const index = this.indexOf(item);
  return this.removeAt(index);
}

Array.prototype.removeLast = function removeLast<T>(this: Array<T>, item: T): boolean {
  const index = this.lastIndexOf(item);
  return this.removeAt(index);
}