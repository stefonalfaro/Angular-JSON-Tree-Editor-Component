import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';

interface TreeNode {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
  expanded?: boolean;
  children?: TreeNode[];
  parent?: TreeNode;
}

@Component({
  selector: 'app-json-editor',
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.css']
})
export class JsonEditorComponent {
  @Input() autoUpdate:boolean = false;
  @Input() jsonData: any = {};
  @Output() jsonChange = new EventEmitter<any>();

  treeNodes: TreeNode[] = [];

  ngOnInit() {
    this.buildTree();
  }

  buildTree() {
    this.treeNodes = [this.createTreeNode('root', this.jsonData, null)];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['jsonData'] && changes['jsonData'].currentValue) {
      this.buildTree();
    }
  }

  createTreeNode(key: string, value: any, parent: TreeNode | null): TreeNode {
    const node: TreeNode = {
      key,
      value,
      type: this.getType(value),
      expanded: true,
      parent: parent || undefined
    };

    if (node.type === 'object') {
      node.children = Object.keys(value || {}).map(k => 
        this.createTreeNode(k, value[k], node)
      );
    } else if (node.type === 'array') {
      node.children = (value || []).map((item: any, index: number) => 
        this.createTreeNode(index.toString(), item, node)
      );
    }

    return node;
  }

  getType(value: any): TreeNode['type'] {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value as TreeNode['type'];
  }

  toggleExpand(node: TreeNode) {
    node.expanded = !node.expanded;
  }

  addChild(parentNode: TreeNode) {
    if (!parentNode.children) parentNode.children = [];
    
    const newKey = parentNode.type === 'array' 
      ? parentNode.children.length.toString() 
      : 'newKey';
    
    const newNode = this.createTreeNode(newKey, '', parentNode);
    parentNode.children.push(newNode);
    this.updateJson();
  }

  removeNode(node: TreeNode) {
    if (!node.parent || !node.parent.children) return;
    
    const index = node.parent.children.indexOf(node);
    if (index > -1) {
      node.parent.children.splice(index, 1);
      
      // Reindex array children
      if (node.parent.type === 'array') {
        node.parent.children.forEach((child, i) => {
          child.key = i.toString();
        });
      }
      
      this.updateJson();
    }
  }

  changeType(node: TreeNode) {
    switch (node.type) {
      case 'string':
        node.value = '';
        break;
      case 'number':
        node.value = 0;
        break;
      case 'boolean':
        node.value = true;
        break;
      case 'object':
        node.value = {};
        node.children = [];
        node.expanded = true;
        break;
      case 'array':
        node.value = [];
        node.children = [];
        node.expanded = true;
        break;
      case 'null':
        node.value = null;
        break;
    }
    this.updateJson();
  }

  updateJson() {
    this.jsonData = this.nodeToJson(this.treeNodes[0]);
    this.jsonChange.emit(this.jsonData);
  }

  updateJsonFromChange() {
    if (this.autoUpdate){
      this.updateJson();
    }
  }

  nodeToJson(node: TreeNode): any {
    if (node.type === 'object') {
      const obj: any = {};
      node.children?.forEach(child => {
        obj[child.key] = this.nodeToJson(child);
      });
      return obj;
    } 
    else if (node.type === 'array') {
      return node.children?.map(child => this.nodeToJson(child)) || [];
    } 
    else {
      return node.value;
    }
  }

  trackByKey(index: number, node: TreeNode): string {
    return `${node.key}_${index}`;
  }

  onNumberKeyDown(event: KeyboardEvent): void {
    // Allow: backspace, delete, tab, escape, enter
    if ([46, 8, 9, 27, 13].indexOf(event.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (event.keyCode === 65 && event.ctrlKey === true) ||
      (event.keyCode === 67 && event.ctrlKey === true) ||
      (event.keyCode === 86 && event.ctrlKey === true) ||
      (event.keyCode === 88 && event.ctrlKey === true) ||
      // Allow: home, end, left, right, up, down
      (event.keyCode >= 35 && event.keyCode <= 40)) {
      return; // let it happen, don't do anything
    }
    // Allow: minus sign for negative numbers (only at the beginning)
    if (event.key === '-' && (event.target as HTMLInputElement).selectionStart === 0) {
      return;
    }
    // Allow: decimal point (only one)
    if (event.key === '.' && (event.target as HTMLInputElement).value.indexOf('.') === -1) {
      return;
    }
    // Ensure that it's a number and stop the keypress
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
    }
  }

  saveChanges() {
    this.updateJson();
  }
}
