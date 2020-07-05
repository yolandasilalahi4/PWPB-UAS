import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Note} from '../modal/Note';
import {AngularFirestore, AngularFirestoreCollection, DocumentReference} from '@angular/fire/firestore';
import {map, take} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private notes: Observable<Note[]>;
  private noteCollection: AngularFirestoreCollection<Note>;

  constructor(private afs: AngularFirestore) {
    this.noteCollection = this.afs.collection<Note>('notes');
    this.notes = this.noteCollection.snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
    );
  }

  getNotes(): Observable<Note[]> {
    return this.notes;
  }

  getNote(id: string): Observable<Note> {
    return this.noteCollection.doc<Note>(id).valueChanges().pipe(
        take(1),
        map(noted => {
          noted.id = id;
          return noted;
        })
    );
  }

  addNote(noted: Note): Promise<DocumentReference> {
    return this.noteCollection.add(noted);
  }

  updateNote(noted: Note): Promise<void> {
    return this.noteCollection.doc(noted.id).update({ title: noted.title, content: noted.content });
  }

  deleteNote(id: string): Promise<void> {
    return this.noteCollection.doc(id).delete();
  }
}
