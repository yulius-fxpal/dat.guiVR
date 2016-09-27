/**
* dat-guiVR Javascript Controller Library for VR
* https://github.com/dataarts/dat.guiVR
*
* Copyright 2016 Data Arts Team, Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import createInteraction from './interaction';

export function create( { group, panel } = {} ){

  const interaction = createInteraction( panel );

  interaction.events.on( 'onPressed', handleOnPress );
  interaction.events.on( 'onReleased', handleOnRelease );

  const tempMatrix = new THREE.Matrix4();

  let oldParent;

  function handleOnPress( p ){

    const { inputObject, input } = p;

    const folder = group.folder;
    if( folder === undefined ){
      return;
    }

    if( folder.beingMoved === true ){
      return;
    }

    tempMatrix.getInverse( inputObject.matrixWorld );

    folder.matrix.premultiply( tempMatrix );
    folder.matrix.decompose( folder.position, folder.quaternion, folder.scale );

    oldParent = folder.parent;
    inputObject.add( folder );

    p.locked = true;

    folder.beingMoved = true;

    input.events.emit( 'grabbed', input );
  }

  function handleOnRelease( { inputObject, input }={} ){
    const folder = group.folder;
    if( folder === undefined ){
      return;
    }

    if( oldParent === undefined ){
      return;
    }

    if( folder.beingMoved === false ){
      return;
    }

    folder.matrix.premultiply( inputObject.matrixWorld );
    folder.matrix.decompose( folder.position, folder.quaternion, folder.scale );
    oldParent.add( folder );
    oldParent = undefined;

    folder.beingMoved = false;

    input.events.emit( 'grabReleased', input );
  }

  return interaction;
}